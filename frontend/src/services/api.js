const API_BASE = '/api';

export async function fetchTemplates() {
  const res = await fetch(`${API_BASE}/templates`);
  if (!res.ok) throw new Error('Failed to fetch templates');
  return res.json();
}

export async function fetchTemplateDetail(idOrSlug) {
  const res = await fetch(`${API_BASE}/templates/${idOrSlug}`);
  if (!res.ok) throw new Error('Template not found');
  return res.json();
}

export async function createOrder(templateId, customerData, confirmed) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      template_id: templateId,
      customer_data: customerData,
      confirmed: confirmed
    })
  });
  
  const data = await res.json();
  if (!res.ok) {
    const errorMsg = typeof data.detail === 'string' 
      ? data.detail 
      : (data.detail?.message || 'Failed to create order');
    throw new Error(errorMsg);
  }
  return data;
}

export async function initiatePayment(orderId) {
  const res = await fetch(`${API_BASE}/payments/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_id: orderId })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Payment initiation failed');
  return data;
}

export async function verifyPayment(orderId, paymentId, signature = 'mock_signature_valid') {
  const res = await fetch(`${API_BASE}/payments/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_id: orderId,
      payment_id: paymentId,
      signature: signature
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Payment verification failed');
  return data;
}

export async function fetchOrderStatus(orderId) {
  const res = await fetch(`${API_BASE}/orders/${orderId}`);
  if (!res.ok) throw new Error('Order not found');
  return res.json();
}

export function getVideoDownloadUrl(orderId) {
  return `${API_BASE}/orders/${orderId}/video`;
}
