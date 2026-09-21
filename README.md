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


<img width="1919" height="873" alt="image" src="https://github.com/user-attachments/assets/7e01140e-c650-4789-8f18-ac6694a3b0a4" />
<img width="1917" height="633" alt="image" src="https://github.com/user-attachments/assets/26e779f2-ea05-4a08-b343-befb4b444540" />
<img width="1919" height="745" alt="image" src="https://github.com/user-attachments/assets/debfcbfa-7bbc-4877-9f1b-bce5c0466a90" />
<img width="1919" height="868" alt="image" src="https://github.com/user-attachments/assets/ddfca369-5704-4a8b-b44b-2f4e8412289e" />
<img width="1163" height="778" alt="image" src="https://github.com/user-attachments/assets/5f01dce5-a224-4060-9728-9984b30a49b5" />
<img width="1919" height="861" alt="image" src="https://github.com/user-attachments/assets/bcbed273-1a36-4911-8cd8-fcf14d2851f0" />
<img width="1164" height="629" alt="image" src="https://github.com/user-attachments/assets/62ed34a4-980b-4f7b-9305-bcde74b0825f" />





