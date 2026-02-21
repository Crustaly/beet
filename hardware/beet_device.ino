/**
 * Beet Device Firmware — ESP32
 * ─────────────────────────────────────────────────────────────────────────────
 * Responsibilities:
 *   1. Walk the patient through a yes/no symptom questionnaire via LCD + buttons.
 *   2. Run a deterministic, weighted rule-based inference engine.
 *   3. Display the result on the LCD.
 *   4. Compute a SHA-256 hash of the symptom bitmask (raw data stays local).
 *   5. POST a structured JSON payload to the Beet backend.
 *
 * Hardware:
 *   - ESP32 DevKit (any variant with WiFi)
 *   - 16×2 I²C LCD (PCF8574 backpack, default addr 0x27)
 *   - 2 push-buttons: GPIO 34 (YES) and GPIO 35 (NO), pulled up internally
 *
 * Libraries required (install via Arduino Library Manager):
 *   - LiquidCrystal_I2C  (Frank de Brabander)
 *   - ArduinoJson         (Benoit Blanchon, v6.x)
 * ─────────────────────────────────────────────────────────────────────────────
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <LiquidCrystal_I2C.h>
#include <mbedtls/md.h>   // Built into ESP32 Arduino core

// ---------------------------------------------------------------------------
// Configuration — edit before flashing
// ---------------------------------------------------------------------------
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* BACKEND_URL   = "http://192.168.1.100:5000/submit";   // Backend IP

// Button GPIO pins (INPUT_PULLUP — connect button to GND)
const int PIN_YES = 34;
const int PIN_NO  = 35;

// LCD address (run I2C scanner sketch if unsure — commonly 0x27 or 0x3F)
LiquidCrystal_I2C lcd(0x27, 16, 2);

// ---------------------------------------------------------------------------
// Data types
// ---------------------------------------------------------------------------
struct Symptoms {
  bool fever;
  bool cough;
  bool fatigue;
  bool stomach_pain;
  bool shortness_of_breath;
  bool sore_throat;
};

struct DiagnosisResult {
  String label;
  float  confidence;
};

// ---------------------------------------------------------------------------
// Inference Engine
// ---------------------------------------------------------------------------
/**
 * Weighted rule-based scoring.
 * Each symptom adds points to candidate diagnoses.
 * Final result = argmax(scores); confidence = maxScore / totalPossibleScore.
 *
 * Scoring table:
 *
 *   Symptom                  | Flu | Cold | COVID | Strep
 *   ─────────────────────────┼─────┼──────┼───────┼──────
 *   fever                    |  3  |  1   |   3   |   2
 *   cough                    |  1  |  2   |   3   |   0
 *   fatigue                  |  2  |  1   |   2   |   1
 *   stomach_pain             |  1  |  0   |   1   |   0
 *   shortness_of_breath      |  0  |  0   |   3   |   0
 *   sore_throat              |  0  |  2   |   1   |   3
 *   ─────────────────────────┴─────┴──────┴───────┴──────
 *   Max possible             |  7  |  6   |  13   |   6
 */
DiagnosisResult runInference(const Symptoms& s) {
  int scores[5] = {0, 0, 0, 0, 0};
  // Index:          0=Flu, 1=Cold, 2=COVID, 3=Strep, 4=Healthy
  int maxPossible  = 0;

  if (s.fever) {
    scores[0] += 3; scores[1] += 1; scores[2] += 3; scores[3] += 2;
    maxPossible += 9;   // 3+1+3+2
  }
  if (s.cough) {
    scores[0] += 1; scores[1] += 2; scores[2] += 3;
    maxPossible += 6;
  }
  if (s.fatigue) {
    scores[0] += 2; scores[1] += 1; scores[2] += 2; scores[3] += 1;
    maxPossible += 6;
  }
  if (s.stomach_pain) {
    scores[0] += 1; scores[2] += 1;
    maxPossible += 2;
  }
  if (s.shortness_of_breath) {
    scores[2] += 3;
    maxPossible += 3;
  }
  if (s.sore_throat) {
    scores[1] += 2; scores[2] += 1; scores[3] += 3;
    maxPossible += 6;
  }

  const char* labels[] = {"Flu", "Cold", "COVID", "Strep", "Healthy"};

  int maxScore = 0, maxIdx = 4;   // default: Healthy
  for (int i = 0; i < 4; i++) {
    if (scores[i] > maxScore) {
      maxScore = scores[i];
      maxIdx   = i;
    }
  }

  float conf = (maxPossible > 0)
    ? constrain((float)maxScore / (float)maxPossible, 0.0f, 1.0f)
    : 1.0f;   // No symptoms at all → Healthy with full confidence

  return { String(labels[maxIdx]), conf };
}

// ---------------------------------------------------------------------------
// SHA-256 of symptom bitmask
// ---------------------------------------------------------------------------
/**
 * Encodes symptoms as a canonical string, then SHA-256 hashes it.
 * The raw symptom values stay on the device — only this hash is transmitted.
 *
 * Format: "fever:1,cough:0,fatigue:1,stomach:0,sob:0,throat:1"
 */
String computeSymptomHash(const Symptoms& s) {
  char buf[80];
  snprintf(buf, sizeof(buf),
           "fever:%d,cough:%d,fatigue:%d,stomach:%d,sob:%d,throat:%d",
           s.fever, s.cough, s.fatigue,
           s.stomach_pain, s.shortness_of_breath, s.sore_throat);

  uint8_t hash[32];
  mbedtls_md_context_t ctx;
  const mbedtls_md_info_t* info = mbedtls_md_info_from_type(MBEDTLS_MD_SHA256);
  mbedtls_md_init(&ctx);
  mbedtls_md_setup(&ctx, info, 0);
  mbedtls_md_starts(&ctx);
  mbedtls_md_update(&ctx, (const uint8_t*)buf, strlen(buf));
  mbedtls_md_finish(&ctx, hash);
  mbedtls_md_free(&ctx);

  String hex = "";
  for (int i = 0; i < 32; i++) {
    char h[3];
    sprintf(h, "%02x", hash[i]);
    hex += h;
  }
  return hex;
}

// ---------------------------------------------------------------------------
// Session ID (random UUID v4)
// ---------------------------------------------------------------------------
String generateSessionId() {
  uint32_t a = esp_random();
  uint32_t b = esp_random();
  uint32_t c = esp_random();
  uint32_t d = esp_random();

  // Set version bits: version 4, variant 10xx
  c = (c & 0x0FFFFFFFu) | 0x40000000u;
  d = (d & 0x3FFFFFFFu) | 0x80000000u;

  char uuid[37];
  snprintf(uuid, sizeof(uuid),
           "%08x-%04x-%04x-%04x-%04x%08x",
           a,
           (b >> 16) & 0xFFFF,
           b & 0xFFFF,
           (c >> 16) & 0xFFFF,
           c & 0xFFFF,
           d);
  return String(uuid);
}

// ---------------------------------------------------------------------------
// LCD helpers
// ---------------------------------------------------------------------------
void lcdPrint(const char* line1, const char* line2 = "") {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(line1);
  if (strlen(line2) > 0) {
    lcd.setCursor(0, 1);
    lcd.print(line2);
  }
}

/**
 * Ask a yes/no question and wait for button press.
 * Returns true for YES, false for NO.
 */
bool askQuestion(const char* question) {
  lcdPrint(question, "Y=BTN1   N=BTN2");
  while (true) {
    if (digitalRead(PIN_YES) == LOW) {
      delay(200);   // debounce
      return true;
    }
    if (digitalRead(PIN_NO) == LOW) {
      delay(200);
      return false;
    }
    delay(50);
  }
}

void showDiagnosis(const DiagnosisResult& r) {
  // Screen 1: label
  lcdPrint("Diagnosis:", r.label.c_str());
  delay(2500);
  // Screen 2: confidence
  char confStr[16];
  snprintf(confStr, sizeof(confStr), "%.1f%% match", r.confidence * 100.0f);
  lcdPrint("Confidence:", confStr);
  delay(2500);
}

// ---------------------------------------------------------------------------
// HTTP submission
// ---------------------------------------------------------------------------
bool submitToBackend(const String& sessionId,
                     const String& symptomHash,
                     const DiagnosisResult& result) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[beet] WiFi not connected — cannot submit");
    return false;
  }

  HTTPClient http;
  http.begin(BACKEND_URL);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(8000);

  StaticJsonDocument<256> doc;
  doc["session_id"]   = sessionId;
  doc["symptom_hash"] = symptomHash;
  doc["diagnosis"]    = result.label;
  doc["confidence"]   = round(result.confidence * 1000.0f) / 1000.0f;

  String body;
  serializeJson(doc, body);

  Serial.print("[beet] POST body: ");
  Serial.println(body);

  int code = http.POST(body);
  String responseBody = http.getString();
  http.end();

  Serial.printf("[beet] HTTP response: %d  %s\n", code, responseBody.c_str());
  return (code == 200 || code == 201);
}

// ---------------------------------------------------------------------------
// WiFi connect
// ---------------------------------------------------------------------------
void connectWiFi() {
  lcdPrint("Connecting WiFi", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\n[beet] WiFi connected: %s\n", WiFi.localIP().toString().c_str());
    lcdPrint("WiFi OK", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\n[beet] WiFi connection failed — offline mode");
    lcdPrint("WiFi FAILED", "Offline mode");
  }
  delay(1500);
}

// ---------------------------------------------------------------------------
// Arduino lifecycle
// ---------------------------------------------------------------------------
void setup() {
  Serial.begin(115200);

  lcd.init();
  lcd.backlight();

  pinMode(PIN_YES, INPUT_PULLUP);
  pinMode(PIN_NO,  INPUT_PULLUP);

  lcdPrint("Beet v0.1", "Initializing...");
  delay(1000);

  connectWiFi();

  lcdPrint("Ready.", "Press YES to go");
}

void loop() {
  // ── Wait for user to start a session ──────────────────────────────────────
  lcdPrint("Beet Triage", "Press YES->Start");
  while (digitalRead(PIN_YES) == HIGH) delay(50);
  delay(200);

  // ── Symptom questionnaire ─────────────────────────────────────────────────
  Symptoms s;
  s.fever              = askQuestion("Fever?");
  s.cough              = askQuestion("Cough?");
  s.fatigue            = askQuestion("Fatigue?");
  s.stomach_pain       = askQuestion("Stomach pain?");
  s.shortness_of_breath = askQuestion("Short of breath?");
  s.sore_throat        = askQuestion("Sore throat?");

  // ── Run inference ─────────────────────────────────────────────────────────
  DiagnosisResult result    = runInference(s);
  String          symHash   = computeSymptomHash(s);
  String          sessionId = generateSessionId();

  Serial.printf("[beet] Session: %s | Diagnosis: %s | Confidence: %.2f\n",
                sessionId.c_str(), result.label.c_str(), result.confidence);
  Serial.printf("[beet] SymptomHash: %s\n", symHash.c_str());

  // ── Display result ────────────────────────────────────────────────────────
  showDiagnosis(result);

  // ── Submit to backend ─────────────────────────────────────────────────────
  lcdPrint("Submitting...", "Please wait");
  bool ok = submitToBackend(sessionId, symHash, result);

  if (ok) {
    lcdPrint("Submitted OK!", sessionId.substring(0, 8).c_str());
  } else {
    lcdPrint("Submit Failed", "See Serial log");
  }

  delay(3000);
  // Loop back to start
}
