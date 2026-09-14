import { ClubConfig } from "./types";

/**
 * Global Club Configuration
 * All branding, institutional details, and contact information come from this config.
 * Neutral placeholders are used so no fake external college or private contact is hardcoded.
 */
export const defaultClubConfig: ClubConfig = {
  clubName: "Internet of Things Club",
  subtitle: "Learn. Build. Connect. Innovate.",
  collegeName: "Sri Shakthi Institute of Engineering and Technology",
  logoText: "IoT CLUB",
  department: "Sri Shakthi Institute of Engineering and Technology",
  description:
    "A student-driven technical community focused on transforming ideas into intelligent, connected systems through IoT, Embedded Systems, Sensors, Microcontrollers, Wireless Communication, Robotics, Automation, Cloud Computing and Edge Computing.",
  footerDescription:
    "The Internet of Things Club at Sri Shakthi Institute of Engineering and Technology provides students with structured, hands-on learning in IoT, Embedded Systems, Robotics, Automation, Wireless Communication, Cloud and Edge Computing through training, projects, certifications, hackathons and real-world innovation.",
  primaryContact: "Faculty Mentor / IoT Club Coordinator",
  email: "iotclub@srishakthi.ac.in",
  address: "IoT & Embedded Systems Laboratory, Sri Shakthi Institute of Engineering and Technology, Coimbatore, Tamil Nadu",
  githubOrg: "iot-club-siet",
  socialLinks: {
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    discord: "https://discord.gg",
  },
};
