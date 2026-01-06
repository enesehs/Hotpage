# Privacy Policy

**Effective Date:** January 6, 2026  
**Last Revised:** January 6, 2026

## 1. Introduction

This Privacy Policy ("Policy") governs the collection, use, and protection of information by HotPage (hereinafter referred to as "the Extension," "we," "us," or "our"), a browser extension application. This Policy describes our data practices and your rights regarding personal information.

By installing and using the Extension, you acknowledge that you have read, understood, and agree to be bound by the terms of this Policy.

## 2. Information Collection and Storage

### 2.1 No Data Collection

The Extension operates on a strict privacy-first principle. We explicitly state that:

- The Extension does **not** collect, transmit, process, or store any personally identifiable information (PII)
- The Extension does **not** collect, transmit, process, or store any usage data, analytics, or telemetry
- The Extension does **not** employ any tracking technologies, including but not limited to cookies, beacons, or similar mechanisms
- The Extension does **not** maintain any servers, databases, or cloud infrastructure for user data storage

### 2.2 Local Data Storage

All application data is stored exclusively within the user's local browser environment using standard browser storage mechanisms:

- **Local Storage (localStorage):** User preferences, application settings, theme configurations, and widget customizations
- **IndexedDB:** User-uploaded media files, including background images
- **Browser Cache:** Temporary operational data required for Extension functionality

This locally stored data:
- Remains exclusively on the user's device
- Is not accessible to the Extension developers
- Is not transmitted to any external servers
- Is governed solely by the user's browser privacy settings

## 3. Data Ownership and Control

### 3.1 User Rights

Users retain complete ownership and control over all data generated or stored by the Extension. Users have the absolute right to:

- Access all locally stored data through browser developer tools
- Modify or delete any data at their discretion
- Export settings and configurations through the Extension's built-in functionality
- Permanently remove all data by uninstalling the Extension

### 3.2 Data Retention and Deletion

Upon uninstallation of the Extension, all locally stored data is automatically purged in accordance with standard browser behavior. Users may also manually delete all data through:

- The Extension's "Reset All Data" functionality in Settings
- Browser-native site data clearing mechanisms
- Manual deletion of browser storage through developer tools

## 4. Third-Party Services and APIs

### 4.1 External API Integration

The Extension integrates with certain third-party application programming interfaces (APIs) to provide enhanced functionality through its widget system. These integrations operate under the following principles:

- API requests are initiated directly from the user's browser
- No data is proxied through Extension-operated servers
- API communications are established only when users actively engage with specific widgets
- Users may disable any widget to prevent associated API communications

### 4.2 Third-Party Service Providers

The Extension may communicate with the following external services:

**Weather Data Provider**
- Service: Open-Meteo (https://open-meteo.com)
- Data Transmitted: Geographic location information (city name or coordinates)
- Purpose: Real-time meteorological data retrieval
- User Control: Weather widget can be disabled

**Currency Exchange Rates**
- Service: ExchangeRate-API (https://exchangerate-api.com)
- Data Transmitted: Selected currency pairs
- Purpose: Current foreign exchange rate information
- User Control: Currency widget can be disabled

**Cryptocurrency Market Data**
- Service: CoinGecko (https://coingecko.com)
- Data Transmitted: Selected cryptocurrency identifiers
- Purpose: Real-time cryptocurrency pricing information
- User Control: Cryptocurrency widget can be disabled

**RSS Feed Aggregation**
- Services: User-configured RSS feed providers
- Data Transmitted: User-specified RSS feed URLs
- Purpose: Content syndication and news aggregation
- User Control: Users maintain complete control over feed sources

**Geolocation Services**
- Services: ipapi.co (https://ipapi.co) and Nominatim (https://nominatim.openstreetmap.org)
- Data Transmitted: IP address (ipapi.co) or geographic queries (Nominatim)
- Purpose: Automatic location detection for weather functionality
- User Control: Users may manually specify location to prevent automatic detection

### 4.3 Third-Party Privacy Policies

Users acknowledge that third-party services maintain independent privacy policies and data practices. The Extension developers:

- Do not control third-party data collection or usage practices
- Are not responsible for third-party privacy policies
- Recommend users review applicable third-party privacy policies
- Cannot guarantee third-party compliance with privacy standards

## 5. Browser Permissions

### 5.1 Required Permissions

The Extension requests the following browser permissions, which are strictly limited to operational necessity:

**Storage Permission**
- Purpose: Local storage of user preferences, settings, and configurations
- Scope: Limited to browser local storage and IndexedDB
- Usage: No data transmitted externally

**Tabs Permission**
- Purpose: New tab behavior management and navigation functionality
- Scope: Limited to new tab replacement and link handling
- Usage: No tab content access or monitoring

**ActiveTab Permission**
- Purpose: Search functionality and user-initiated link opening
- Scope: Limited to active tab interactions initiated by user actions
- Usage: No background tab monitoring or content injection

### 5.2 Permission Limitations

The Extension:
- Does not request `<all_urls>` or broad host permissions
- Does not access browsing history
- Does not access bookmarks without explicit user action
- Does not monitor or record browsing activity
- Does not inject content into web pages without user initiation

## 6. Security Measures

### 6.1 Technical Security Controls

The Extension implements industry-standard security practices:

**Cross-Site Scripting (XSS) Protection**
- All user-provided content is sanitized using DOMPurify library
- SVG and HTML inputs undergo strict validation
- Content Security Policy (CSP) headers enforced where applicable

**Input Validation**
- All user inputs validated against predefined schemas using Zod validation library
- Type checking enforced through TypeScript compilation
- Malicious input patterns detected and rejected

**Secure Data Handling**
- All external URLs validated before processing
- User-uploaded files scanned for malicious content
- No execution of untrusted code or scripts

### 6.2 Vulnerability Management

The Extension development team:
- Maintains up-to-date dependencies to address known vulnerabilities
- Monitors security advisories for third-party libraries
- Implements security patches promptly upon discovery of vulnerabilities
- Encourages responsible disclosure of security issues through GitHub

## 7. Children's Privacy

### 7.1 COPPA Compliance

The Extension does not knowingly collect personal information from children under the age of 13 years, consistent with the Children's Online Privacy Protection Act (COPPA). Given that the Extension collects no personal data from any users, it is suitable for use by all age groups.

### 7.2 Parental Guidance

Notwithstanding the above, we recommend that parents and legal guardians:
- Monitor their children's internet usage
- Review the Extension's functionality before allowing minor use
- Educate children about internet safety and privacy

## 8. International Data Transfers

As the Extension does not collect or transmit any user data, no international data transfers occur. All data remains within the user's local browser environment.

## 9. Policy Modifications

### 9.1 Right to Modify

We reserve the right to modify this Privacy Policy at any time. Material changes to this Policy will be communicated through:
- Updates to this document with revised "Last Revised" date
- In-Extension notifications where appropriate
- Notices on the Extension's official website and GitHub repository

### 9.2 Continued Use

Continued use of the Extension following any modifications to this Policy constitutes acceptance of such modifications. Users who do not agree with modified terms should discontinue use and uninstall the Extension.

## 10. Contact Information

### 10.1 Inquiries and Complaints

For questions, concerns, or complaints regarding this Privacy Policy or the Extension's data practices, please contact us through:

- **Email:** enesehs@protonmail.com
- **Official Repository:** https://github.com/enesehs/Hotpage
- **Issue Tracker:** https://github.com/enesehs/Hotpage/issues
- **Official Website:** https://enesehs.dev/Hotpage

### 10.2 Response Time

We endeavor to respond to all legitimate inquiries within a reasonable timeframe, typically within 30 days of receipt.

## 11. Third-Party Links and Content

The Extension may contain links to third-party websites, services, or resources (including but not limited to Quick Links, RSS feeds, and external APIs). We:
- Are not responsible for the privacy practices of third-party sites
- Do not endorse or assume responsibility for third-party content
- Recommend users review the privacy policies of all third-party sites they visit

## 12. Legal Compliance

This Privacy Policy is designed to comply with applicable data protection laws and regulations, including but not limited to:
- General Data Protection Regulation (GDPR) for European Union users
- California Consumer Privacy Act (CCPA) for California residents
- Other applicable regional and national privacy legislation

## 13. Open Source Verification

### 13.1 Source Code Availability

The Extension is distributed as open-source software. Users may verify our privacy claims by:
- Inspecting the complete source code at: https://github.com/enesehs/Hotpage
- Reviewing commit history and code changes
- Conducting independent security audits
- Reporting discrepancies through GitHub Issues

### 13.2 License

The Extension is distributed under the MIT License, which permits inspection, modification, and distribution of the source code subject to license terms.

## 14. Limitations of Liability

To the maximum extent permitted by applicable law, the Extension developers shall not be liable for:
- Data practices of third-party services or APIs
- Security breaches resulting from user device compromise
- Data loss resulting from user actions or browser malfunctions
- Damages arising from unauthorized third-party access to locally stored data

## 15. Governing Law

This Privacy Policy shall be governed by and construed in accordance with applicable international data protection standards and the laws of the jurisdiction in which the user resides, without regard to conflict of law principles.

## 16. Severability

If any provision of this Privacy Policy is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.

## 17. Entire Agreement

This Privacy Policy constitutes the entire agreement between the user and the Extension developers regarding data practices and supersedes all prior or contemporaneous understandings regarding such subject matter.

---

## Summary of Key Points

**Data Collection:** None. The Extension collects zero personal data.

**Data Storage:** All data stored locally in user's browser only.

**Data Transmission:** No data transmitted to Extension developers or servers.

**Third-Party APIs:** Direct browser-to-API communication for widget functionality only.

**User Control:** Complete ownership and control of all locally stored data.

**Security:** Industry-standard security measures including XSS protection and input validation.

**Open Source:** Full source code available for verification at https://github.com/enesehs/Hotpage

---

**Document Version:** 1.0  
**Effective Date:** January 6, 2026  
**Last Revised:** January 6, 2026
