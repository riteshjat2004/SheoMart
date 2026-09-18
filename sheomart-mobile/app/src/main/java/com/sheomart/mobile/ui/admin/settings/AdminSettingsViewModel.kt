package com.sheomart.mobile.ui.admin.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sheomart.mobile.data.model.PlatformFeeConfig
import com.sheomart.mobile.data.repository.AdminRepository
import com.sheomart.mobile.ui.state.UiState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class AdminSettingsUiState(
    val feeConfigState: UiState<PlatformFeeConfig> = UiState.Loading,
    val isSavingProfile: Boolean = false,
    val isChangingPassword: Boolean = false,
    val isSavingFee: Boolean = false,
    val feedbackMessage: String? = null
)

class AdminSettingsViewModel(
    private val repository: AdminRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AdminSettingsUiState())
    val uiState: StateFlow<AdminSettingsUiState> = _uiState.asStateFlow()

    init {
        loadFeeConfig()
    }

    fun loadFeeConfig() {
        viewModelScope.launch {
            _uiState.update { it.copy(feeConfigState = UiState.Loading) }
            val result = repository.getPlatformFeeConfig()
            result.fold(
                onSuccess = { config ->
                    _uiState.update { it.copy(feeConfigState = UiState.Success(config)) }
                },
                onFailure = {
                    // Fallback default config
                    _uiState.update { it.copy(feeConfigState = UiState.Success(PlatformFeeConfig())) }
                }
            )
        }
    }

    fun updateProfile(name: String, mobile: String, avatar: String?) {
        viewModelScope.launch {
            _uiState.update { it.copy(isSavingProfile = true) }
            val result = repository.updateProfile(name, mobile, avatar)
            result.fold(
                onSuccess = {
                    _uiState.update { it.copy(isSavingProfile = false, feedbackMessage = "Admin profile updated successfully.") }
                },
                onFailure = { error ->
                    _uiState.update { it.copy(isSavingProfile = false, feedbackMessage = error.message ?: "Update profile failed") }
                }
            )
        }
    }

    fun changePassword(currentPass: String, newPass: String, confirmPass: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(isChangingPassword = true) }
            val result = repository.changePassword(currentPass, newPass, confirmPass)
            result.fold(
                onSuccess = {
                    _uiState.update { it.copy(isChangingPassword = false, feedbackMessage = "Password changed successfully.") }
                },
                onFailure = { error ->
                    _uiState.update { it.copy(isChangingPassword = false, feedbackMessage = error.message ?: "Password change failed") }
                }
            )
        }
    }

    fun savePlatformFee(config: PlatformFeeConfig) {
        viewModelScope.launch {
            _uiState.update { it.copy(isSavingFee = true) }
            val result = repository.updatePlatformFeeConfig(config)
            result.fold(
                onSuccess = {
                    _uiState.update {
                        it.copy(
                            isSavingFee = false,
                            feeConfigState = UiState.Success(config),
                            feedbackMessage = "Platform fee configuration updated."
                        )
                    }
                },
                onFailure = { error ->
                    _uiState.update { it.copy(isSavingFee = false, feedbackMessage = error.message ?: "Failed to update platform fee") }
                }
            )
        }
    }

    fun dismissFeedback() {
        _uiState.update { it.copy(feedbackMessage = null) }
    }
}
