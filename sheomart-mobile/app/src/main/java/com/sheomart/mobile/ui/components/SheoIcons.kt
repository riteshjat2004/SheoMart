package com.sheomart.mobile.ui.components

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.graphics.vector.PathParser
import androidx.compose.ui.graphics.vector.ImageVector.Builder
import androidx.compose.ui.unit.dp

fun sheoIcon(name: String, pathData: String): ImageVector = Builder(name, 24.dp, 24.dp, 24f, 24f).addPath(PathParser().parsePathString(pathData).toNodes(), fill = SolidColor(Color.Black)).build()

val PersonIcon = sheoIcon("Person", "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z")
val LockIcon = sheoIcon("Lock", "M18 8h-1V6a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9Zm-6 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm3-9H9V6a3 3 0 0 1 6 0v2Z")
val EmailIcon = sheoIcon("Email", "M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z")
val VisibilityIcon = sheoIcon("Visibility", "M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z")
val VisibilityOffIcon = sheoIcon("VisibilityOff", "M2 4.27 3.28 3 21 20.72 19.73 22l-3.04-3.04A10.8 10.8 0 0 1 12 20c-5 0-9.27-3.11-11-7a12.4 12.4 0 0 1 4.16-4.95L2 4.27ZM12 7c5 0 9.27 3.11 11 7a12.4 12.4 0 0 1-4.16 4.95l-2.2-2.2A5 5 0 0 0 9.25 9.36L7.3 7.41A10.8 10.8 0 0 1 12 7Z")