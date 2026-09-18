package com.sheomart.mobile.ui.admin.analytics

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sheomart.mobile.data.model.AdminAnalyticsOverview
import com.sheomart.mobile.data.repository.AdminRepository
import com.sheomart.mobile.ui.state.UiState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

data class AdminAnalyticsUiState(
    val overviewState: UiState<AdminAnalyticsOverview> = UiState.Loading,
    val selectedPresetDays: Int = 30, // 7, 30, 90
    val feedbackMessage: String? = null
)

class AdminAnalyticsViewModel(
    private val repository: AdminRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AdminAnalyticsUiState())
    val uiState: StateFlow<AdminAnalyticsUiState> = _uiState.asStateFlow()

    init {
        loadAnalytics(30)
    }

    fun selectPreset(days: Int) {
        _uiState.update { it.copy(selectedPresetDays = days) }
        loadAnalytics(days)
    }

    fun loadAnalytics(days: Int = _uiState.value.selectedPresetDays) {
        viewModelScope.launch {
            _uiState.update { it.copy(overviewState = UiState.Loading) }

            val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.US)
            val cal = Calendar.getInstance(TimeZone.getTimeZone("UTC"))
            val toDate = sdf.format(cal.time)
            cal.add(Calendar.DAY_OF_YEAR, -(days - 1))
            val fromDate = sdf.format(cal.time)

            val result = repository.getAnalyticsOverview(from = fromDate, to = toDate, timezone = "UTC")
            result.fold(
                onSuccess = { overview ->
                    _uiState.update { it.copy(overviewState = UiState.Success(overview)) }
                },
                onFailure = { error ->
                    _uiState.update {
                        it.copy(overviewState = UiState.Error(error.message ?: "Unable to load analytics"))
                    }
                }
            )
        }
    }

    fun dismissFeedback() {
        _uiState.update { it.copy(feedbackMessage = null) }
    }
}
