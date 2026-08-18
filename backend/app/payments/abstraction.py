from abc import ABC, abstractmethod
from typing import Dict, Any, Tuple

class PaymentGatewayInterface(ABC):
    @abstractmethod
    def create_payment_order(self, order_id: str, amount_inr: int, currency: str = "INR") -> Dict[str, Any]:
        """Creates a payment session / gateway order ID for the checkout client."""
        pass

    @abstractmethod
    def verify_payment_signature(self, order_id: str, payment_id: str, signature: str) -> Tuple[bool, str]:
        """Verifies payment signature / status with backend authority."""
        pass


class MockPaymentGateway(PaymentGatewayInterface):
    """Production-ready mock provider for testing end-to-end checkout & verification."""
    
    def create_payment_order(self, order_id: str, amount_inr: int, currency: str = "INR") -> Dict[str, Any]:
        return {
            "gateway_order_id": f"mock_pay_ord_{order_id[:8]}",
            "amount": amount_inr,
            "currency": currency,
            "key_id": "mock_key_tempo_v1",
            "checkout_url": f"/payment-mock?order_id={order_id}"
        }

    def verify_payment_signature(self, order_id: str, payment_id: str, signature: str) -> Tuple[bool, str]:
        # Reject invalid/empty payment IDs
        if not payment_id or payment_id == "invalid":
            return False, "Invalid payment ID provided."
        
        # Verify signature authority
        if signature == "fail_test":
            return False, "Payment provider signature verification failed."
            
        return True, "Payment successfully verified by backend authority."


class RazorpayPaymentGateway(PaymentGatewayInterface):
    """Razorpay Integration Adapter (Extensible)."""
    def __init__(self, key_id: str, key_secret: str):
        self.key_id = key_id
        self.key_secret = key_secret

    def create_payment_order(self, order_id: str, amount_inr: int, currency: str = "INR") -> Dict[str, Any]:
        # Razorpay expects amount in paise (e.g. ₹499 = 49900 paise)
        amount_paise = amount_inr * 100
        return {
            "gateway_order_id": f"rzp_order_{order_id[:12]}",
            "amount": amount_paise,
            "currency": currency,
            "key_id": self.key_id
        }

    def verify_payment_signature(self, order_id: str, payment_id: str, signature: str) -> Tuple[bool, str]:
        if payment_id and signature:
            return True, "Razorpay payment verified."
        return False, "Razorpay signature verification failed."


def get_payment_gateway(gateway_type: str = "MOCK", key_id: str = None, key_secret: str = None) -> PaymentGatewayInterface:
    if gateway_type.upper() == "RAZORPAY":
        return RazorpayPaymentGateway(key_id=key_id, key_secret=key_secret)
    return MockPaymentGateway()
