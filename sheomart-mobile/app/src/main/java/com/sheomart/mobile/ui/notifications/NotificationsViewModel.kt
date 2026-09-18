package com.sheomart.mobile.ui.notifications

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sheomart.mobile.data.model.NotificationItem
import com.sheomart.mobile.ui.state.UiState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class NotificationsViewModel : ViewModel() {

    private val _notificationsState = MutableStateFlow<UiState<List<NotificationItem>>>(UiState.Loading)
    val notificationsState: StateFlow<UiState<List<NotificationItem>>> = _notificationsState.asStateFlow()

    init {
        loadNotifications()
    }

    fun loadNotifications() {
        viewModelScope.launch {
            _notificationsState.value = UiState.Loading
            // In SheoMart, notifications include live order tracking alerts, festival discounts, and store broadcasts
            val list = listOf(
                NotificationItem(
                    notificationId = "notif_1",
                    title = "Welcome to SheoMart! 🌾",
                    message = "Connecting local neighborhood stores across Sheopur district with fast delivery and calm shopping.",
                    type = "system",
                    isRead = false,
                    createdAt = "Today"
                ),
                NotificationItem(
                    notificationId = "notif_2",
                    title = "Festival Offer Live 🏷️",
                    message = "Use code SHEOPUR20 for flat 20% off on fresh produce and pantry staples.",
                    type = "offer",
                    isRead = false,
                    createdAt = "Yesterday"
                ),
                NotificationItem(
                    notificationId = "notif_3",
                    title = "Order Dispatched 🚚",
                    message = "Your local store has handed over your basket for doorstep delivery.",
                    type = "order",
                    isRead = true,
                    createdAt = "2 days ago"
                )
            )
            _notificationsState.value = UiState.Success(list)
        }
    }

    fun markAllAsRead() {
        val current = (_notificationsState.value as? UiState.Success)?.data ?: return
        _notificationsState.value = UiState.Success(current.map { it.copy(isRead = true) })
    }
}
