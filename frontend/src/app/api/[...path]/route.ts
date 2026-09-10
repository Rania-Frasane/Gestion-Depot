import { NextRequest, NextResponse } from 'next/server';

async function handleRequest(request: NextRequest, path: string[], method: string) {
  const searchParams = request.nextUrl.search || '';
  const joinedPath = path.join('/');
  const cleanPath = joinedPath.endsWith('/') ? joinedPath : `${joinedPath}/`;
  const backendUrl = `http://127.0.0.1:8000/api/${cleanPath}${searchParams}`;
  
  try {
    const headers: Record<string, string> = {};
    const reqContentType = request.headers.get('content-type');
    
    if (!reqContentType || !reqContentType.includes('multipart/form-data')) {
      headers['Content-Type'] = 'application/json';
    }
    
    const auth = request.headers.get('Authorization');
    if (auth) headers['Authorization'] = auth;

    let body: any = undefined;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      if (reqContentType && reqContentType.includes('multipart/form-data')) {
        body = await request.formData();
      } else {
        try {
          body = JSON.stringify(await request.json());
        } catch (e) {
          body = undefined;
        }
      }
    }

    const response = await fetch(backendUrl, {
      method,
      headers,
      body,
      cache: 'no-store',
    });

    const contentType = response.headers.get('content-type');
    
    // Handle 204 No Content explicitly (must not have a body)
    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } else {
      const buffer = await response.arrayBuffer();
      const nextHeaders = new Headers();
      if (contentType) nextHeaders.set('Content-Type', contentType);
      
      const disposition = response.headers.get('content-disposition');
      if (disposition) nextHeaders.set('Content-Disposition', disposition);
      
      return new NextResponse(buffer, { 
        status: response.status,
        headers: nextHeaders
      });
    }
  } catch (error: any) {
    console.error(`[Proxy Error] ${method} ${backendUrl}:`, error.message);
    return NextResponse.json(
      { error: 'Backend unreachable', details: error.message }, 
      { status: 502 }
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleRequest(request, path, 'GET');
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleRequest(request, path, 'POST');
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleRequest(request, path, 'PUT');
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleRequest(request, path, 'DELETE');
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleRequest(request, path, 'PATCH');
}
