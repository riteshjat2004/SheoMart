package com.sheomart.mobile.utils

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import com.sheomart.mobile.data.model.AuthSession
import com.sheomart.mobile.data.model.AuthTokens
import java.nio.charset.StandardCharsets
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

class SecureTokenStore(context: Context) {
    private val preferences = context.getSharedPreferences("auth_tokens", Context.MODE_PRIVATE)
    private val keyAlias = "sheomart_auth_key"
    fun save(session: AuthSession) = saveTokens(AuthTokens(session.accessToken, session.refreshToken))
    fun saveTokens(tokens: AuthTokens) { preferences.edit().putString("access_token", encrypt(tokens.accessToken)).putString("refresh_token", encrypt(tokens.refreshToken)).apply() }
    fun accessToken(): String? = preferences.getString("access_token", null)?.let(::decrypt)
    fun refreshToken(): String? = preferences.getString("refresh_token", null)?.let(::decrypt)
    fun clear() = preferences.edit().clear().apply()
    private fun key(): SecretKey {
        val store = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        val existing = store.getEntry(keyAlias, null) as? KeyStore.SecretKeyEntry
        if (existing != null) return existing.secretKey

        val generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
        generator.init(
            KeyGenParameterSpec.Builder(
                keyAlias,
                KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT,
            )
                .setKeySize(256)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .build(),
        )
        return generator.generateKey()
    }
    private fun encrypt(value: String): String { val cipher = Cipher.getInstance("AES/GCM/NoPadding"); cipher.init(Cipher.ENCRYPT_MODE, key()); return Base64.encodeToString(cipher.iv + cipher.doFinal(value.toByteArray(StandardCharsets.UTF_8)), Base64.NO_WRAP) }
    private fun decrypt(value: String): String { val payload = Base64.decode(value, Base64.NO_WRAP); val cipher = Cipher.getInstance("AES/GCM/NoPadding"); cipher.init(Cipher.DECRYPT_MODE, key(), GCMParameterSpec(128, payload.copyOfRange(0, 12))); return cipher.doFinal(payload.copyOfRange(12, payload.size)).toString(StandardCharsets.UTF_8) }
}