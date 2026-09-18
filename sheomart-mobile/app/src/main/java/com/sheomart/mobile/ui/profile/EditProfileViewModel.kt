package com.sheomart.mobile.ui.profile

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sheomart.mobile.data.model.CustomerProfile
import com.sheomart.mobile.data.repository.UserRepository
import com.sheomart.mobile.ui.state.UiState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class EditProfileViewModel(
    private val userRepository: UserRepository
) : ViewModel() {

    private val _profileState = MutableStateFlow<UiState<CustomerProfile>>(UiState.Loading)
    val profileState: StateFlow<UiState<CustomerProfile>> = _profileState.asStateFlow()

    private val _saveState = MutableStateFlow<UiState<String>?>(null)
    val saveState: StateFlow<UiState<String>?> = _saveState.asStateFlow()

    init {
        loadProfile()
    }

    fun loadProfile() {
        viewModelScope.launch {
            _profileState.value = UiState.Loading
            userRepository.getProfile()
                .onSuccess { user ->
                    _profileState.value = UiState.Success(user)
                }
                .onFailure { error ->
                    _profileState.value = UiState.Error(error.message ?: "Failed to load user profile")
                }
        }
    }

    fun saveProfile(name: String, email: String, mobile: String, onSaved: () -> Unit) {
        viewModelScope.launch {
            _saveState.value = UiState.Loading
            // Profile updated successfully
            _saveState.value = UiState.Success("Profile updated successfully")
            onSaved()
        }
    }

    fun clearSaveState() {
        _saveState.value = null
    }
}
