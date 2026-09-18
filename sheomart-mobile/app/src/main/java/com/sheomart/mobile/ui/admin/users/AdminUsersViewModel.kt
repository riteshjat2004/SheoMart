package com.sheomart.mobile.ui.admin.users

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sheomart.mobile.data.model.AdminUserItem
import com.sheomart.mobile.data.model.AdminUserPagination
import com.sheomart.mobile.data.repository.AdminRepository
import com.sheomart.mobile.ui.state.UiState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class AdminUsersUiState(
    val usersState: UiState<List<AdminUserItem>> = UiState.Loading,
    val pagination: AdminUserPagination = AdminUserPagination(),
    val searchQuery: String = "",
    val selectedRole: String? = null, // null = All, "customer", "store_owner", "platform_admin"
    val currentPage: Int = 1,
    val feedbackMessage: String? = null
)

class AdminUsersViewModel(
    private val repository: AdminRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AdminUsersUiState())
    val uiState: StateFlow<AdminUsersUiState> = _uiState.asStateFlow()

    init {
        loadUsers()
    }

    fun loadUsers() {
        viewModelScope.launch {
            _uiState.update { it.copy(usersState = UiState.Loading) }
            val current = _uiState.value

            val result = repository.getAdminUsers(
                search = current.searchQuery.ifBlank { null },
                role = current.selectedRole,
                page = current.currentPage,
                limit = 20
            )

            result.fold(
                onSuccess = { response ->
                    _uiState.update {
                        it.copy(
                            usersState = if (response.users.isEmpty()) UiState.Empty else UiState.Success(response.users),
                            pagination = response.pagination
                        )
                    }
                },
                onFailure = { error ->
                    _uiState.update {
                        it.copy(usersState = UiState.Error(error.message ?: "Unable to load users"))
                    }
                }
            )
        }
    }

    fun onSearchChange(query: String) {
        _uiState.update { it.copy(searchQuery = query, currentPage = 1) }
        loadUsers()
    }

    fun onRoleChange(role: String?) {
        _uiState.update { it.copy(selectedRole = role, currentPage = 1) }
        loadUsers()
    }

    fun nextPage() {
        val current = _uiState.value
        if (current.currentPage < current.pagination.totalPages) {
            _uiState.update { it.copy(currentPage = current.currentPage + 1) }
            loadUsers()
        }
    }

    fun previousPage() {
        val current = _uiState.value
        if (current.currentPage > 1) {
            _uiState.update { it.copy(currentPage = current.currentPage - 1) }
            loadUsers()
        }
    }

    fun dismissFeedback() {
        _uiState.update { it.copy(feedbackMessage = null) }
    }
}
