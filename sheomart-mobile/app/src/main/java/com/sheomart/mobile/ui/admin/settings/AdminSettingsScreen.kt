package com.sheomart.mobile.ui.admin.settings

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sheomart.mobile.data.model.AuthUser
import com.sheomart.mobile.data.model.PlatformFeeConfig
import com.sheomart.mobile.ui.admin.components.AdminTopAppBar
import com.sheomart.mobile.ui.state.UiState
import com.sheomart.mobile.ui.theme.*

@Composable
fun AdminSettingsScreen(
    user: AuthUser?,
    viewModel: AdminSettingsViewModel,
    onBack: () -> Unit,
    onLogout: () -> Unit,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }
    val scrollState = rememberScrollState()

    LaunchedEffect(uiState.feedbackMessage) {
        uiState.feedbackMessage?.let { msg ->
            snackbarHostState.showSnackbar(msg)
            viewModel.dismissFeedback()
        }
    }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        topBar = {
            AdminTopAppBar(
                title = "Settings & Security",
                subtitle = "Administrator account & platform configuration",
                onBack = onBack
            )
        },
        containerColor = Background,
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(scrollState)
        ) {
            Spacer(modifier = Modifier.height(16.dp))

            // ==========================================
            // 1. ADMIN PROFILE FORM
            // ==========================================
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
                    .shadow(2.dp, shape = RoundedCornerShape(20.dp), spotColor = Color(0x14000000))
                    .clip(RoundedCornerShape(20.dp))
                    .background(Color.White)
                    .border(1.dp, Border, RoundedCornerShape(20.dp))
                    .padding(18.dp)
            ) {
                var name by remember(user?.name) { mutableStateOf(user?.name ?: "") }
                var mobile by remember(user?.mobile) { mutableStateOf(user?.mobile ?: "") }

                Column(modifier = Modifier.fillMaxWidth()) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .clip(CircleShape)
                                .background(PrimaryGreen),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = (user?.name?.take(1) ?: "A").uppercase(),
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = Color.White)
                            )
                        }
                        Column {
                            Text(text = "Administrator Profile", style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold))
                            Text(text = user?.email ?: "", style = MaterialTheme.typography.bodySmall, color = SecondaryText)
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    OutlinedTextField(
                        value = name,
                        onValueChange = { name = it },
                        label = { Text("Full Name") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    OutlinedTextField(
                        value = mobile,
                        onValueChange = { mobile = it },
                        label = { Text("Mobile Number") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Button(
                        onClick = { viewModel.updateProfile(name.trim(), mobile.trim(), null) },
                        enabled = !uiState.isSavingProfile,
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.align(Alignment.End)
                    ) {
                        Text(if (uiState.isSavingProfile) "Saving..." else "Save Profile", fontWeight = FontWeight.Bold)
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // ==========================================
            // 2. CHANGE PASSWORD FORM
            // ==========================================
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
                    .shadow(2.dp, shape = RoundedCornerShape(20.dp), spotColor = Color(0x14000000))
                    .clip(RoundedCornerShape(20.dp))
                    .background(Color.White)
                    .border(1.dp, Border, RoundedCornerShape(20.dp))
                    .padding(18.dp)
            ) {
                var currentPass by remember { mutableStateOf("") }
                var newPass by remember { mutableStateOf("") }
                var confirmPass by remember { mutableStateOf("") }
                var passError by remember { mutableStateOf<String?>(null) }

                Column(modifier = Modifier.fillMaxWidth()) {
                    Text(text = "🔑 Change Password", style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold))
                    Text(text = "Must be at least 8 characters with numbers & symbols", style = MaterialTheme.typography.bodySmall, color = SecondaryText)

                    Spacer(modifier = Modifier.height(12.dp))

                    OutlinedTextField(
                        value = currentPass,
                        onValueChange = { currentPass = it; passError = null },
                        label = { Text("Current Password") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedTextField(
                        value = newPass,
                        onValueChange = { newPass = it; passError = null },
                        label = { Text("New Password") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedTextField(
                        value = confirmPass,
                        onValueChange = { confirmPass = it; passError = null },
                        label = { Text("Confirm New Password") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    if (passError != null) {
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(passError!!, color = Error, style = MaterialTheme.typography.bodySmall)
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Button(
                        onClick = {
                            if (currentPass.length < 8 || newPass.length < 8) {
                                passError = "Passwords must be at least 8 characters"
                                return@Button
                            }
                            if (newPass != confirmPass) {
                                passError = "New passwords do not match"
                                return@Button
                            }
                            viewModel.changePassword(currentPass, newPass, confirmPass)
                            currentPass = ""
                            newPass = ""
                            confirmPass = ""
                        },
                        enabled = !uiState.isChangingPassword,
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.align(Alignment.End)
                    ) {
                        Text(if (uiState.isChangingPassword) "Updating..." else "Update Password", fontWeight = FontWeight.Bold)
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // ==========================================
            // 3. PLATFORM FEE CONFIGURATION
            // ==========================================
            val feeConfig = (uiState.feeConfigState as? UiState.Success)?.data
            if (feeConfig != null) {
                var amountText by remember(feeConfig.amount) { mutableStateOf(feeConfig.amount.toString()) }
                var feeType by remember(feeConfig.feeType) { mutableStateOf(feeConfig.feeType) }
                var minOrderText by remember(feeConfig.minimumOrderAmount) { mutableStateOf(feeConfig.minimumOrderAmount.toString()) }
                var enabled by remember(feeConfig.enabled) { mutableStateOf(feeConfig.enabled) }

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp)
                        .shadow(2.dp, shape = RoundedCornerShape(20.dp), spotColor = Color(0x14000000))
                        .clip(RoundedCornerShape(20.dp))
                        .background(Color.White)
                        .border(1.dp, Border, RoundedCornerShape(20.dp))
                        .padding(18.dp)
                ) {
                    Column(modifier = Modifier.fillMaxWidth()) {
                        Text(text = "💳 Platform Fee Configuration", style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold))
                        Text(text = "Fee applied to customer checkouts across Sheopur", style = MaterialTheme.typography.bodySmall, color = SecondaryText)

                        Spacer(modifier = Modifier.height(14.dp))

                        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            OutlinedTextField(
                                value = amountText,
                                onValueChange = { amountText = it },
                                label = { Text("Fee Amount (₹ or %)") },
                                singleLine = true,
                                modifier = Modifier.weight(1f)
                            )

                            OutlinedTextField(
                                value = minOrderText,
                                onValueChange = { minOrderText = it },
                                label = { Text("Min Order (₹)") },
                                singleLine = true,
                                modifier = Modifier.weight(1f)
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(10.dp))
                                .background(Surface)
                                .clickable { enabled = !enabled }
                                .padding(horizontal = 12.dp, vertical = 8.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Enable Platform Fee", style = MaterialTheme.typography.bodyMedium)
                            Switch(
                                checked = enabled,
                                onCheckedChange = { enabled = it },
                                colors = SwitchDefaults.colors(checkedThumbColor = PrimaryGreen)
                            )
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        Button(
                            onClick = {
                                val amt = amountText.toDoubleOrNull() ?: 10.0
                                val minOrd = minOrderText.toDoubleOrNull() ?: 0.0
                                viewModel.savePlatformFee(
                                    PlatformFeeConfig(
                                        amount = amt,
                                        feeType = feeType,
                                        minimumOrderAmount = minOrd,
                                        enabled = enabled
                                    )
                                )
                            },
                            enabled = !uiState.isSavingFee,
                            colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.align(Alignment.End)
                        ) {
                            Text(if (uiState.isSavingFee) "Saving..." else "Save Platform Fee", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // ==========================================
            // 4. APP VERSION & SIGN OUT
            // ==========================================
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "SheoMart Administrator Workspace · Version 1.0.0",
                    style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                    color = SecondaryText
                )

                Spacer(modifier = Modifier.height(14.dp))

                OutlinedButton(
                    onClick = onLogout,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Error),
                    border = ButtonDefaults.outlinedButtonBorder.copy(
                        brush = androidx.compose.ui.graphics.SolidColor(Error.copy(alpha = 0.5f))
                    )
                ) {
                    Text("Sign Out Administrator", fontWeight = FontWeight.Bold, color = Error)
                }
            }

            Spacer(modifier = Modifier.height(36.dp))
        }
    }
}
