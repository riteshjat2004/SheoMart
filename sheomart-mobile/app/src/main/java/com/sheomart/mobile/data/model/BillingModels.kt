package com.sheomart.mobile.data.model

data class PosProductItem(
    val productId: String,
    val name: String,
    val sku: String? = null,
    val price: Double = 0.0,
    val discountPrice: Double? = null,
    val availableQuantity: Int = 0,
    val categoryName: String? = null,
    val thumbnail: String? = null
) {
    val displayPrice: Double get() = discountPrice ?: price
}

data class BillingCartItem(
    val product: PosProductItem,
    var quantity: Int = 1,
    var itemDiscount: Double = 0.0
) {
    val unitPrice: Double get() = product.displayPrice
    val lineSubtotal: Double get() = unitPrice * quantity
    val lineTotal: Double get() = (lineSubtotal - itemDiscount).coerceAtLeast(0.0)
}

data class PosCustomer(
    val customerId: String? = null,
    val name: String,
    val mobile: String? = null,
    val isPlus: Boolean = false
)

data class InvoiceRecord(
    val invoiceId: String,
    val invoiceNumber: String,
    val customerName: String = "Walk-in Customer",
    val customerPhone: String? = null,
    val paymentMethod: String = "CASH", // "CASH", "UPI", "CREDIT"
    val paymentStatus: String = "PAID", // "PAID", "PENDING", "PARTIALLY_PAID"
    val grandTotal: Double = 0.0,
    val amountPaid: Double = 0.0,
    val remainingAmount: Double = 0.0,
    val totalItems: Int = 0,
    val status: String = "COMPLETED",
    val createdAt: String? = null,
    val notes: String? = null
)

data class PickupOrderRecord(
    val orderId: String,
    val customerName: String = "Customer",
    val customerPhone: String? = null,
    val items: List<OrderItemRecord> = emptyList(),
    val totalAmount: Double = 0.0,
    val status: String = "ACCEPTED", // "ACCEPTED", "PREPARING", "READY_FOR_PICKUP", "DELIVERED"
    val paymentStatus: String = "PAID", // "PAID", "PENDING"
    val paymentMethod: String = "PAY_AT_PICKUP",
    val pickupSlot: String? = null,
    val createdAt: String? = null
)

data class DailyCashSummary(
    val openingCash: Double = 2000.0,
    val cashSales: Double = 0.0,
    val upiSales: Double = 0.0,
    val totalSales: Double = 0.0,
    val expectedCash: Double = 2000.0,
    val totalOrders: Int = 0
)
