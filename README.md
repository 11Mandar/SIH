# LogNexus

### Universal Log Pre-Processing Framework

> **SIH Problem Statement:** SIH26156  
> **Domain:** CyberSecurity / Software  
> **Project:** LogNexus  
> **Purpose:** Universal preprocessing, normalization and onboarding of heterogeneous security logs.

---

## 📌 Overview

Modern IT environments generate logs from many different sources such as:

- Windows systems
- Linux systems
- Firewalls
- Routers
- Switches
- Security tools
- Applications
- Cloud platforms
- IoT devices

Each source can produce logs in a different format, structure and terminology.

This creates a major challenge for security monitoring systems because downstream analytics and SIEM platforms need structured and consistent event data.

**LogNexus** is a centralized log preprocessing framework designed to convert heterogeneous log sources into a **common Universal Event Schema**.

The framework follows a configurable processing pipeline:

```text
Heterogeneous Log Sources
          │
          ▼
     Ingestion Layer
          │
          ▼
    Format Detection
          │
          ▼
        Parsing
          │
          ▼
   Field Mapping / Normalization
          │
          ▼
       Validation
          │
          ├───────────────┐
          ▼               ▼
      Raw Event      Normalized Event
          │               │
          └───────┬───────┘
                  ▼
             PostgreSQL
                  │
                  ▼
       Dashboard / SIEM /
       Data Lake / Analytics
