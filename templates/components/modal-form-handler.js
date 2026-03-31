/**
 * Modal Form Handler
 * Manages AJAX form submissions within modals with proper error handling
 */

class ModalFormHandler {
    constructor() {
        this.formSelectors = '[data-modal-form]';
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Form submission handler
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.hasAttribute('data-modal-form')) {
                e.preventDefault();
                this.submitForm(form);
            }
        });

        // Open modal with AJAX form
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-modal-url]')) {
                const trigger = e.target.closest('[data-modal-url]');
                this.loadFormInModal(
                    trigger.dataset.modalUrl,
                    trigger.dataset.modalId || 'ajaxModal'
                );
            }
        });
    }

    /**
     * Load a form from a URL and display it in a modal
     */
    async loadFormInModal(url, modalId = 'ajaxModal') {
        try {
            const response = await fetch(url, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const html = await response.text();
            const modal = document.getElementById(modalId) || this.createModalContainer(modalId);

            // Insert form HTML into modal
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const form = doc.querySelector('form');

            if (form) {
                modal.innerHTML = `
                    <div class="modal-overlay active">
                        <div class="modal-content max-w-2xl">
                            <div class="modal-header">
                                <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                                    ${form.dataset.title || 'Formulaire'}
                                </h2>
                                <button type="button" onclick="modalManager.close('${modalId}')"
                                        class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl leading-none">
                                    &times;
                                </button>
                            </div>
                            <div class="modal-body">
                                ${form.outerHTML}
                            </div>
                        </div>
                    </div>
                `;

                // Re-initialize form handler for the new form
                this.setupEventListeners();
                modalManager.open(modalId);
            }
        } catch (error) {
            console.error('Error loading form:', error);
            this.showError('Impossible de charger le formulaire');
        }
    }

    /**
     * Submit a form via AJAX
     */
    async submitForm(form) {
        const modalId = form.closest('.modal-overlay')?.id;
        const formData = new FormData(form);

        try {
            const response = await fetch(form.action, {
                method: form.method.toUpperCase(),
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            const data = await response.json();

            if (data.success) {
                // Close modal and refresh page or list
                if (modalId) {
                    modalManager.close(modalId);
                }
                this.showSuccess(data.message || 'Enregistré avec succès');

                // Refresh the list or redirect after delay
                setTimeout(() => {
                    if (data.redirect) {
                        window.location.href = data.redirect;
                    } else {
                        location.reload();
                    }
                }, 1000);
            } else {
                // Display validation errors
                this.displayErrors(data.errors, form);
                this.showError(data.message || 'Erreur lors de l\'enregistrement');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            this.showError('Erreur lors de l\'enregistrement');
        }
    }

    /**
     * Display validation errors in form fields
     */
    displayErrors(errors, form) {
        // Clear previous errors
        form.querySelectorAll('[data-error]').forEach(el => el.remove());

        // Display new errors
        Object.entries(errors).forEach(([fieldName, messages]) => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                const errorEl = document.createElement('div');
                errorEl.className = 'text-red-500 text-sm mt-1';
                errorEl.dataset.error = 'true';
                errorEl.textContent = messages[0] || 'Erreur';
                field.parentElement.appendChild(errorEl);
                field.classList.add('border-red-500');
            }
        });
    }

    /**
     * Create a modal container if it doesn't exist
     */
    createModalContainer(modalId) {
        const modal = document.createElement('div');
        modal.id = modalId;
        document.body.appendChild(modal);
        return modal;
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 3000);
    }

    /**
     * Show error message
     */
    showError(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 3000);
    }
}

// Initialize on document ready
const modalFormHandler = new ModalFormHandler();
document.addEventListener('DOMContentLoaded', () => {
    modalFormHandler.init();
});
