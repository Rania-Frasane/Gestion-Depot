"""
forecasting.py – Smart Demand Forecasting Engine
Analyzes historical MouvementStock data to predict future demand
and generate reorder recommendations using simple statistical methods.
No external ML library required — uses pure Python math.
"""
from datetime import timedelta, date
from django.utils import timezone
from django.db.models import Sum


def _get_daily_exits(produit_id: int, days: int) -> list[int]:
    """Returns a list of daily 'sortie' quantities for the past `days` days."""
    from produits.models import MouvementStock
    today = timezone.now().date()
    daily = []
    for i in range(days - 1, -1, -1):
        d = today - timedelta(days=i)
        qty = MouvementStock.objects.filter(
            produit_id=produit_id,
            type_mouvement='sortie',
            created_at__date=d
        ).aggregate(t=Sum('quantite'))['t'] or 0
        daily.append(qty)
    return daily


def _linear_regression(y: list[float]) -> tuple[float, float]:
    """Simple linear regression: returns (slope, intercept)."""
    n = len(y)
    if n < 2:
        return 0.0, y[0] if y else 0.0
    x = list(range(n))
    x_mean = sum(x) / n
    y_mean = sum(y) / n
    num = sum((x[i] - x_mean) * (y[i] - y_mean) for i in range(n))
    den = sum((x[i] - x_mean) ** 2 for i in range(n))
    slope = num / den if den != 0 else 0.0
    intercept = y_mean - slope * x_mean
    return slope, intercept


def _moving_average(data: list[float], window: int = 7) -> list[float]:
    """Returns the moving average of a series."""
    result = []
    for i in range(len(data)):
        start = max(0, i - window + 1)
        result.append(sum(data[start:i + 1]) / (i - start + 1))
    return result


def forecast_product(produit_id: int, horizon_days: int = 30) -> dict:
    """
    Forecast demand for a single product.

    Returns a dict with:
    - avg_daily_demand (float)
    - trend (str): 'hausse' | 'baisse' | 'stable'
    - predicted_total (float): total units needed over horizon
    - confidence (str): 'haute' | 'moyenne' | 'faible'
    - historical_labels (list[str])
    - historical_values (list[int])
    - forecast_labels (list[str])
    - forecast_values (list[float])
    - moving_avg (list[float])
    """
    from produits.models import Produit
    try:
        produit = Produit.objects.get(pk=produit_id)
    except Produit.DoesNotExist:
        return {}

    history_days = 90
    daily = _get_daily_exits(produit_id, history_days)

    non_zero = [d for d in daily if d > 0]
    avg = sum(daily) / len(daily) if daily else 0.0
    slope, intercept = _linear_regression([float(d) for d in daily])

    # Trend classification
    if slope > 0.05:
        trend = 'hausse'
    elif slope < -0.05:
        trend = 'baisse'
    else:
        trend = 'stable'

    # Confidence based on how many days had activity
    active_ratio = len(non_zero) / history_days if history_days else 0
    if active_ratio > 0.5:
        confidence = 'haute'
    elif active_ratio > 0.2:
        confidence = 'moyenne'
    else:
        confidence = 'faible'

    # Forecast future values using linear trend
    today = timezone.now().date()
    forecast_values = []
    forecast_labels = []
    for i in range(1, horizon_days + 1):
        predicted = max(0.0, intercept + slope * (history_days + i))
        forecast_values.append(round(predicted, 1))
        forecast_labels.append((today + timedelta(days=i)).strftime('%d/%m'))

    predicted_total = sum(forecast_values)

    # Labels for historical chart
    hist_labels = [
        (today - timedelta(days=history_days - 1 - i)).strftime('%d/%m')
        for i in range(history_days)
    ]

    ma = _moving_average([float(d) for d in daily], window=7)

    # Reorder recommendation
    stock_actuel = produit.stock_actuel
    reorder_needed = predicted_total > stock_actuel
    reorder_qty = max(0, int(predicted_total - stock_actuel + produit.stock_minimum))

    return {
        'produit_id': produit_id,
        'produit_nom': produit.nom,
        'produit_code': produit.code,
        'stock_actuel': stock_actuel,
        'stock_minimum': produit.stock_minimum,
        'avg_daily_demand': round(avg, 2),
        'trend': trend,
        'slope': round(slope, 4),
        'predicted_total': round(predicted_total, 1),
        'confidence': confidence,
        'reorder_needed': reorder_needed,
        'reorder_qty': reorder_qty,
        'historical_labels': hist_labels,
        'historical_values': daily,
        'forecast_labels': forecast_labels,
        'forecast_values': forecast_values,
        'moving_avg': [round(v, 2) for v in ma],
    }


def forecast_all_products(top_n: int = 20) -> list[dict]:
    """
    Run forecast for the top N most active products.
    Returns a sorted list of forecast results, highest demand first.
    Also includes low-stock products that may have no recent movement.
    """
    from produits.models import MouvementStock, Produit
    from django.db.models import Sum, F

    today = timezone.now().date()
    cutoff = today - timedelta(days=90)

    # Get most active products by exit quantity in past 90 days
    active = (
        MouvementStock.objects
        .filter(type_mouvement='sortie', created_at__date__gte=cutoff)
        .values('produit_id')
        .annotate(total=Sum('quantite'))
        .order_by('-total')[:top_n]
    )

    results = []
    seen_ids = set()
    for row in active:
        r = forecast_product(row['produit_id'], horizon_days=30)
        if r:
            results.append(r)
            seen_ids.add(row['produit_id'])

    # Also include low-stock products not captured above
    low_stock = Produit.objects.filter(
        actif=True,
        stock_actuel__lte=F('stock_minimum')
    ).exclude(pk__in=seen_ids)[:10]

    for p in low_stock:
        r = forecast_product(p.pk, horizon_days=30)
        if r:
            results.append(r)

    # Sort: reorder_needed first, then by predicted_total desc
    results.sort(key=lambda x: (-int(x['reorder_needed']), -x['predicted_total']))
    return results

