package com.sheomart.mobile.ui.state

sealed interface UiState<out T> {
    object Loading : UiState<Nothing>
    data class Success<T>(val data: T) : UiState<T>
    object Empty : UiState<Nothing>
    data class Error(val message: String) : UiState<Nothing>
}
