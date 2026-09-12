import { ClubConfig } from "./types";

/**
 * Global Club Configuration
 * All branding, institutional details, and contact information come from this config.
 * Neutral placeholders are used so no fake external college or private contact is hardcoded.
 */
export const defaultClubConfig: ClubConfig = {
  clubName: "IoT Club",
  subtitle: "Learning • Building • Innovating",
  collegeName: "Engineering Institute",
  logoText: "IoT CLUB",
  department: "Interdisciplinary Technology & Innovation Center",
  description:
    "A student-driven digital engineering ecosystem for embedded systems, robotics, edge computing, and real-world hardware innovation.",
  primaryContact: "Faculty Mentor / Lab Admin",
  email: "contact@iotclub.org",
  address: "IoT & Embedded Systems Laboratory, Tech Block, Level 3",
  githubOrg: "iot-club-org",
  socialLinks: {
    github: "https://github.com/iot-club-org",
    linkedin: "https://linkedin.com/company/iot-club-org",
    discord: "https://discord.gg/iotclub",
  },
};
