# Third-Party Digital Risk Analyzer

This project provides a web application to analyze the digital risks associated with a third-party supplier, using only their domain name as input. It assesses various aspects of their online presence based on publicly available internet information and utilizes AI (e.g., via Google Gemini API) for more nuanced analysis like sentiment and content interpretation.

The tool generates a scored checklist, provides justifications for each score, and offers a summary. If the overall score is 60% or higher, it's considered a "pass." Otherwise, specific recommendations or an explanation of the vendor's shortcomings are provided.

## Key Features & Checklist

The analysis is based on the following checklist items, each with specific scoring:

1.  **Basic Presence (Domain, Email, Website):**
    *   **Logic:** Checks if the vendor has their own resolvable domain, accessible website (HTTP/HTTPS), and email infrastructure (MX records).
    *   **Score:** Reduce 10 points if any component is missing.
    *   **Outcome:** If this check fails (-10 points), the review ends, and the vendor is declared "FAIL" immediately.

2.  **DMARC Compliance:**
    *   **Logic:** Checks if the domain's DMARC DNS record is present and configured with a `p=reject` policy.
    *   **Score:** Add 10 points if fully compliant with `p=reject`. Reduce 10 points otherwise.

3.  **Website Security (Basic):**
    *   **Logic:** Checks if the website enforces HTTPS and has basic security headers (e.g., HSTS). This is a high-level check, not a full penetration test.
    *   **Score:** Add 5 points if reasonably secure. Reduce 10 points if insecure (e.g., no HTTPS, major SSL errors).

4.  **Declared Policies & GRC Status:**
    *   **Logic:** Attempts to find dedicated sections or clear declarations on the vendor's website regarding Privacy Policy, Information Security Policy, and GRC certifications (e.g., ISO 27001, SOC 2). AI may be used to analyze page content.
    *   **Score:** Add up to 10 points.
        *   +3 for clear Privacy information.
        *   +3 for clear Information Security information.
        *   +4 for clear GRC/Certifications information.
        *   Partial points are awarded based on what's found.

5.  **Reported Breaches (Cybersecurity, Privacy):**
    *   **Logic:** Performs an online search (potentially AI-assisted) for publicly declared or third-party reported cybersecurity breaches, privacy violations, or other significant data incidents related to the vendor.
    *   **Score:** Reduce 10 points if any significant, credible breach is identified. (Default: 0 points if none found).

6.  **History of Litigation:**
    *   **Logic:** Performs an online search (potentially AI-assisted) for a history of significant litigation against the vendor or its key staff (e.g., related to fraud, negligence).
    *   **Score:** Reduce 3 points if more than 2 significant litigation cases are found.

7.  **Online Reputation (Reviews Sentiment):**
    *   **Logic:** Searches for online reviews and uses AI for sentiment analysis to determine if the overall perception is positive, negative, or mixed/neutral.
    *   **Score:** Add 3 points if predominantly positive. Reduce 2 points if predominantly negative. 0 points for mixed/neutral or insufficient data.

8.  **Organization Longevity:**
    *   **Logic:** Estimates how long the organization has been in business, primarily based on the domain's WHOIS registration date.
    *   **Score:** Add 1 point if the domain age suggests more than 5 years in business.

9.  **Passive Vulnerability Scan:**
    *   **Logic:** Checks for publicly identifiable vulnerabilities based on passive scans and information (e.g., outdated server software visible in headers, known CVEs from public sources - **does not perform active scanning**). AI might assist in interpreting findings from conceptual public data sources.
    *   **Score:** Add 10 points if no serious or critical vulnerabilities are identified. Reduce 10 points if any serious or critical vulnerability is identified.

## Scoring and Reporting

*   **Total Score:** Calculated based on the points awarded for each checklist item.
*   **Maximum Possible Positive Score:** 39 points.
*   **Outcome:**
    *   If the "Basic Presence" check fails, the vendor is immediately marked as "FAIL."
    *   Otherwise, if the `(Total Score / Maximum Possible Positive Score) * 100` is >= 60%, the summary indicates a "PASS."
    *   If less than 60%, the summary provides recommendations based on the failed/negative checks.
    *   If below the threshold and not an immediate fail, the summary explains the shortcomings of the vendor.
*   **Details & Justifications:** Each checklist item in the report includes its score, a justification for that score, and any relevant details gathered during the analysis.

## Technology Stack

*   **Backend:** Python (FastAPI)
*   **Frontend:** HTML, CSS, JavaScript
*   **AI Integration:** Designed to work with AI services like OpenAI's API (GPT models) for tasks such as content analysis, sentiment analysis, and interpreting search results.
*   **Key Python Libraries:**
    *   `fastapi` & `uvicorn` for the web framework.
    *   `httpx` for asynchronous HTTP requests.
    *   `beautifulsoup4` & `lxml` for web scraping.
    *   `dnspython` for DNS lookups (MX, TXT records).
    *   `python-whois` for WHOIS lookups.
    *   `openai` (or similar for other AI providers) for AI interactions.
    *   `python-dotenv` for managing environment variables.

## Prerequisites

*   Python 3.8+
*   `pip` (Python package installer)
*   Git
*   An API Key from an AI provider (e.g., OpenAI). This project is currently configured to expect an `OPENAI_API_KEY`.

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    python -m venv venv
    # On Windows
    # venv\Scripts\activate
    # On macOS/Linux
    source venv/bin/activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
    *(Note: You'll need to create a `requirements.txt` file. See below.)*

4.  **Configure Environment Variables:**
    Create a `.env` file in the root of the project directory with your AI API key:
    ```
    OPENAI_API_KEY="sk-YourActualOpenAIKeyHere"
    ```
    The application uses `python-dotenv` to load this variable. Alternatively, you can set it directly in your shell environment.

## Creating `requirements.txt`

Based on the libraries mentioned, your `requirements.txt` file should look something like this:


# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
