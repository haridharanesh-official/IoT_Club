"use client";

import React, { useState } from "react";
import {
  Bot,
  X,
  Send,
  Sparkles,
  HelpCircle,
  Lightbulb,
  Cpu,
  AlertTriangle,
  ExternalLink,
  Code2,
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "mentor";
  text: string;
  timestamp: string;
  codeSnippet?: string;
  warning?: string;
  recommendedModule?: { title: string; link: string };
}

export const AIMentorModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "mentor",
      text: "Hello! I am your IoT Club Technical Assistant. I can help you debug hardware circuits (I2C/SPI), troubleshoot FreeRTOS firmware, configure Mosquitto MQTT brokers, and guide your next learning track. How can I help with your hardware today?",
      timestamp: "Just now",
    },
  ]);

  const [inputQuery, setInputQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const cannedQuestions = [
    "Why can't my ESP32 detect BH1750 on I2C?",
    "Which ESP32 pins should I avoid (strapping pins)?",
    "Explain MQTT retain messages vs QoS.",
    "What learning track should I take after Arduino?",
    "How do I debug an intermittent Wi-Fi / MQTT connection?",
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery("");
    setIsTyping(true);

    setTimeout(() => {
      let reply: ChatMessage;
      const qLower = query.toLowerCase();

      if (qLower.includes("bh1750") || qLower.includes("i2c")) {
        reply = {
          id: `bot-${Date.now()}`,
          sender: "mentor",
          text: "When an ESP32 fails to detect a BH1750 ambient light sensor, verify these 4 critical hardware items:\n\n1. I2C Bus Address: BH1750 uses address 0x23 by default if the ADDR pin is connected to GND (or floating on most GY-302 breakout modules). If ADDR is pulled HIGH to 3.3V, its address changes to 0x5C.\n2. Pull-Up Resistors: ESP32 internal pull-ups (approx 45kΩ) are too weak for I2C above 100kHz. Ensure 4.7kΩ pull-up resistors connect from SDA (GPIO21) and SCL (GPIO22) to 3.3V.\n3. Voltage: Power the module from 3.3V, not 5V, to prevent damaging ESP32 3.3V-tolerant GPIOs.\n4. Run the Club I2C Scanner firmware to check acknowledged ACK bits on the bus.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          codeSnippet: `// Run I2C Scanner on ESP32\n#include <Wire.h>\nvoid setup() {\n  Wire.begin(21, 22); // SDA, SCL\n  Serial.begin(115200);\n  Serial.println("Scanning I2C bus...");\n  for (byte addr = 1; addr < 127; addr++) {\n    Wire.beginTransmission(addr);\n    if (Wire.endTransmission() == 0) {\n      Serial.printf("Found I2C device at: 0x%02X\\n", addr);\n    }\n  }\n}`,
          recommendedModule: {
            title: "Track 2: Module 202 - Embedded Systems & Bus Protocols",
            link: "/learn",
          },
        };
      } else if (qLower.includes("pin") || qLower.includes("strapping") || qLower.includes("gpio")) {
        reply = {
          id: `bot-${Date.now()}`,
          sender: "mentor",
          text: "ESP32 has several Strapping Pins that determine bootloader behavior during power-up or reset. Miswiring these will prevent the ESP32 from booting or flashing firmware:\n\n• GPIO 0: Must be HIGH for SPI flash boot. If pulled LOW during reset, enters flash upload mode.\n• GPIO 2: Must be LOW or floating during flashing. Connected to the onboard blue LED on most dev boards.\n• GPIO 12 (MTDI): Sets flash voltage (3.3V vs 1.8V). Pulling this HIGH during boot will brick/prevent flash read!\n• GPIO 15: Must be HIGH during boot.\n• GPIO 34, 35, 36, 39: Input-only pins! They have NO internal pull-up/down resistors and cannot be used as OUTPUTs.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          warning: "Never connect low-impedance sensor outputs or relays to GPIO 0, 2, or 12 without isolation resistors.",
          recommendedModule: {
            title: "Track 2: Embedded Systems - GPIO Registers & Pin Safety",
            link: "/learn",
          },
        };
      } else if (qLower.includes("mqtt") || qLower.includes("retain") || qLower.includes("qos")) {
        reply = {
          id: `bot-${Date.now()}`,
          sender: "mentor",
          text: "Here is the key distinction in MQTT telemetry design:\n\n• Retain Flag: When a publisher sends a message with retain=true, the broker saves the last message on that topic. When a new dashboard or client connects and subscribes, it immediately receives this last known good state without waiting for the next periodic sensor cycle.\n\n• QoS 0 (At most once): Fire and forget. Best for high-frequency sensor streams (e.g. ambient temp every second).\n• QoS 1 (At least once): Broker sends PUBACK. Message may duplicate if network hiccups, but guaranteed delivery.\n• QoS 2 (Exactly once): 4-step handshake. High overhead, rarely needed in sensor networks; used in financial transactions.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          codeSnippet: `// Publishing with Retain flag enabled\nmqttClient.publish("iotclub/sensors/ESP024/state", jsonBuffer, true);`,
        };
      } else if (qLower.includes("after arduino") || qLower.includes("learn next")) {
        reply = {
          id: `bot-${Date.now()}`,
          sender: "mentor",
          text: "Great progress! After mastering Arduino basics (blocking loops, analogRead, digitalRead), here is your verified learning progression in the IoT Club:\n\n1. Step 1: ESP32 Microcontroller Architecture - transition from single-core blocking code to dual-core FreeRTOS tasks (Pinned to Core 0 for Wi-Fi and Core 1 for sensors).\n2. Step 2: IoT Networking - connect via Mosquitto MQTT broker with JSON payloads and implement Last Will Testament (LWT).\n3. Step 3: Single Board Computers (Raspberry Pi & Linux) - learn headless Linux CLI, setup Docker edge containers, and build a local telemetry gateway.\n\nWould you like to explore Track 2: Embedded Systems now?",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          recommendedModule: {
            title: "Track 2: Embedded Systems - FreeRTOS & Dual Core",
            link: "/learn",
          },
        };
      } else {
        reply = {
          id: `bot-${Date.now()}`,
          sender: "mentor",
          text: `Analyzing your inquiry: "${query}".\n\nIn our club lab, we recommend starting by checking the physical circuit schematic, verifying pin voltages with a multimeter or oscilloscope bench station, and inspecting the Serial baud rate (standard is 115200 for ESP32). Check our curriculum modules or ask me for specific wiring pinouts!`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          recommendedModule: {
            title: "Explore All 8 Structured Learning Tracks",
            link: "/learn",
          },
        };
      }

      setMessages((prev) => [...prev, reply]);
      setIsTyping(false);
    }, 700);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 backdrop-blur-sm">
      <div className="bg-dark-surface border border-dark-border rounded-2xl w-full max-w-2xl h-[620px] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-dark-card border-b border-dark-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-iot-violet/20 border border-iot-violet/50 flex items-center justify-center text-iot-violet">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-sm">IoT Club AI Mentor</h3>
                <span className="px-1.5 py-0.2 rounded bg-iot-emerald/20 text-emerald-400 border border-iot-emerald/40 text-[10px] font-mono">
                  Online
                </span>
              </div>
              <p className="text-xs text-slate-400">Firmware diagnostics, sensor pinouts, and curriculum guidance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                  m.sender === "user"
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                    : "bg-dark-card border border-dark-border text-slate-200"
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>

                {m.warning && (
                  <div className="mt-2.5 p-2 rounded bg-amber-950/40 border border-amber-800/60 text-amber-300 text-[11px] flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>{m.warning}</span>
                  </div>
                )}

                {m.codeSnippet && (
                  <div className="mt-2.5">
                    <div className="text-[10px] text-slate-400 font-mono mb-1 flex items-center gap-1">
                      <Code2 className="w-3 h-3" /> Diagnostic Code
                    </div>
                    <pre className="text-[11px] font-mono bg-slate-950 p-2 rounded text-emerald-400 border border-slate-800 overflow-x-auto">
                      {m.codeSnippet}
                    </pre>
                  </div>
                )}

                {m.recommendedModule && (
                  <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-iot-cyan">
                    <span className="font-medium">Recommended: {m.recommendedModule.title}</span>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 px-1">{m.timestamp}</span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
              <Sparkles className="w-3.5 h-3.5 text-iot-violet animate-spin" />
              <span>Analyzing circuit documentation and firmware guidelines...</span>
            </div>
          )}
        </div>

        {/* Suggested Quick Questions */}
        <div className="px-4 py-2 border-t border-dark-border bg-dark-card/50">
          <div className="text-[11px] text-slate-400 mb-1.5 font-medium flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-400" /> Common Inquiries:
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {cannedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="shrink-0 px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-[10px] transition whitespace-nowrap"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-dark-card border-t border-dark-border flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask a technical question (ESP32 pinouts, FreeRTOS, MQTT, wiring)..."
            className="flex-1 bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-iot-cyan"
          />
          <button
            onClick={() => handleSend()}
            className="p-2 rounded-xl bg-iot-cyan hover:bg-cyan-400 text-slate-950 font-medium transition"
            title="Send inquiry"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
