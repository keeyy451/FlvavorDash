import { decode as atob } from 'base-64';

/**
 * jwtMiddleware.js
 * ============================================================
 * SOAL 2 — MIDDLEWARE JWT (JSON Web Token)
 * 
 * Modul ini mengimplementasikan fungsi-fungsi middleware untuk:
 * 1. Verifikasi struktur JWT (Header.Payload.Signature)
 * 2. Validasi expiration time (exp claim)
 * 3. Decode payload untuk ekstraksi user data
 * 4. Simulasi signature verification
 * 
 * KONSEP JWT:
 * JWT terdiri dari 3 bagian yang dipisahkan titik (.):
 *   - Header  : Berisi algoritma (alg) dan tipe token (typ)
 *   - Payload : Berisi claims (sub, name, email, iat, exp)
 *   - Signature: Verifikasi integritas token (HMAC-SHA256)
 * 
 * Alur Middleware:
 *   Request → [validateTokenStructure] → [checkExpiration]
 *           → [verifySignature] → [extractUserData] → GRANT ACCESS
 *   
 *   Jika gagal di tahap manapun → REDIRECT ke Login
 * ============================================================
 */

// ============================================================
// STEP 1: Validasi Struktur Token
// JWT harus memiliki format: xxxxx.yyyyy.zzzzz
// ============================================================
export function validateTokenStructure(token) {
  if (!token || typeof token !== 'string') {
    return {
      valid: false,
      error: 'Token tidak ditemukan atau bukan string',
      code: 'TOKEN_MISSING',
    };
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return {
      valid: false,
      error: `Token harus memiliki 3 bagian (Header.Payload.Signature), ditemukan ${parts.length} bagian`,
      code: 'INVALID_STRUCTURE',
    };
  }

  // Cek bahwa setiap bagian tidak kosong
  if (parts.some(part => part.length === 0)) {
    return {
      valid: false,
      error: 'Salah satu bagian token kosong',
      code: 'EMPTY_SEGMENT',
    };
  }

  return { valid: true, parts };
}

// ============================================================
// STEP 2: Decode Header JWT
// Header berisi informasi algoritma dan tipe token
// Contoh: { "alg": "HS256", "typ": "JWT" }
// ============================================================
export function decodeHeader(token) {
  const { valid, parts, error } = validateTokenStructure(token);
  if (!valid) return { valid: false, error };

  try {
    const headerJSON = atob(parts[0]);
    const header = JSON.parse(headerJSON);

    // Validasi field wajib di header
    if (!header.alg) {
      return {
        valid: false,
        error: 'Header tidak memiliki field "alg" (algorithm)',
        code: 'MISSING_ALG',
      };
    }

    if (!header.typ || header.typ !== 'JWT') {
      return {
        valid: false,
        error: 'Header "typ" harus bernilai "JWT"',
        code: 'INVALID_TYP',
      };
    }

    return { valid: true, header };
  } catch (e) {
    return {
      valid: false,
      error: 'Gagal decode header: format Base64 tidak valid',
      code: 'DECODE_ERROR',
    };
  }
}

// ============================================================
// STEP 3: Decode & Validasi Payload
// Payload berisi claims tentang user dan metadata token
// Standard Claims: sub, iat, exp, iss, aud
// ============================================================
export function decodePayload(token) {
  const { valid, parts, error } = validateTokenStructure(token);
  if (!valid) return { valid: false, error };

  try {
    const payloadJSON = atob(parts[1]);
    const payload = JSON.parse(payloadJSON);

    return { valid: true, payload };
  } catch (e) {
    return {
      valid: false,
      error: 'Gagal decode payload: format Base64 tidak valid',
      code: 'DECODE_ERROR',
    };
  }
}

// ============================================================
// STEP 4: Cek Expiration Time
// Memastikan token belum expired berdasarkan claim "exp"
// exp berisi Unix timestamp (detik sejak 1 Jan 1970)
// ============================================================
export function checkExpiration(token) {
  const { valid, payload, error } = decodePayload(token);
  if (!valid) return { valid: false, error };

  if (!payload.exp) {
    return {
      valid: false,
      error: 'Token tidak memiliki claim "exp" (expiration)',
      code: 'MISSING_EXP',
    };
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp <= now) {
    return {
      valid: false,
      error: `Token sudah expired pada ${new Date(payload.exp * 1000).toLocaleString('id-ID')}`,
      code: 'TOKEN_EXPIRED',
      expiredAt: new Date(payload.exp * 1000),
    };
  }

  // Hitung sisa waktu
  const remainingSeconds = payload.exp - now;
  const remainingMinutes = Math.floor(remainingSeconds / 60);

  return {
    valid: true,
    expiresAt: new Date(payload.exp * 1000),
    remainingMinutes,
    remainingSeconds,
  };
}

// ============================================================
// STEP 5: Verifikasi Signature (Simulasi)
// Di produksi, server memverifikasi signature menggunakan
// HMAC-SHA256 dengan secret key yang hanya diketahui server.
// Formula: HMACSHA256(base64UrlEncode(header) + "." +
//          base64UrlEncode(payload), secret)
// ============================================================
export function verifySignature(token) {
  const { valid, parts, error } = validateTokenStructure(token);
  if (!valid) return { valid: false, error };

  try {
    // Simulasi: di produksi ini dilakukan oleh server
    const signature = parts[2];
    if (!signature || signature.length === 0) {
      return {
        valid: false,
        error: 'Signature tidak valid atau kosong',
        code: 'INVALID_SIGNATURE',
      };
    }

    // Simulasi verifikasi berhasil
    return {
      valid: true,
      message: 'Signature terverifikasi (simulasi)',
      algorithm: 'HS256',
    };
  } catch (e) {
    return {
      valid: false,
      error: 'Gagal memverifikasi signature',
      code: 'SIGNATURE_ERROR',
    };
  }
}

// ============================================================
// STEP 6: Full Middleware Pipeline
// Menjalankan semua validasi secara berurutan
// Ini adalah fungsi utama yang dipanggil oleh ProtectedRoute
// ============================================================
export function runMiddlewarePipeline(token) {
  const steps = [];

  // Step 1: Validasi struktur
  const structureResult = validateTokenStructure(token);
  steps.push({
    step: 'Validasi Struktur',
    status: structureResult.valid ? 'PASS' : 'FAIL',
    detail: structureResult.valid
      ? 'Format Header.Payload.Signature valid'
      : structureResult.error,
  });
  if (!structureResult.valid) {
    return { authenticated: false, steps, error: structureResult.error };
  }

  // Step 2: Decode & validasi header
  const headerResult = decodeHeader(token);
  steps.push({
    step: 'Decode Header',
    status: headerResult.valid ? 'PASS' : 'FAIL',
    detail: headerResult.valid
      ? `Algorithm: ${headerResult.header.alg}, Type: ${headerResult.header.typ}`
      : headerResult.error,
  });
  if (!headerResult.valid) {
    return { authenticated: false, steps, error: headerResult.error };
  }

  // Step 3: Decode payload
  const payloadResult = decodePayload(token);
  steps.push({
    step: 'Decode Payload',
    status: payloadResult.valid ? 'PASS' : 'FAIL',
    detail: payloadResult.valid
      ? `User: ${payloadResult.payload.name} (${payloadResult.payload.email})`
      : payloadResult.error,
  });
  if (!payloadResult.valid) {
    return { authenticated: false, steps, error: payloadResult.error };
  }

  // Step 4: Cek expiration
  const expirationResult = checkExpiration(token);
  steps.push({
    step: 'Cek Expiration',
    status: expirationResult.valid ? 'PASS' : 'FAIL',
    detail: expirationResult.valid
      ? `Valid, sisa ${expirationResult.remainingMinutes} menit`
      : expirationResult.error,
  });
  if (!expirationResult.valid) {
    return { authenticated: false, steps, error: expirationResult.error };
  }

  // Step 5: Verifikasi signature
  const signatureResult = verifySignature(token);
  steps.push({
    step: 'Verifikasi Signature',
    status: signatureResult.valid ? 'PASS' : 'FAIL',
    detail: signatureResult.valid
      ? `${signatureResult.message} (${signatureResult.algorithm})`
      : signatureResult.error,
  });
  if (!signatureResult.valid) {
    return { authenticated: false, steps, error: signatureResult.error };
  }

  // Semua step berhasil
  return {
    authenticated: true,
    steps,
    user: payloadResult.payload,
    expiresAt: expirationResult.expiresAt,
    remainingMinutes: expirationResult.remainingMinutes,
  };
}

// ============================================================
// STEP 7: Extract User Data dari Token
// Mengambil informasi user dari payload tanpa full validation
// ============================================================
export function extractUserFromToken(token) {
  const { valid, payload } = decodePayload(token);
  if (!valid) return null;

  return {
    id: payload.sub,
    name: payload.name,
    email: payload.email,
    issuedAt: new Date(payload.iat * 1000),
    expiresAt: new Date(payload.exp * 1000),
  };
}
