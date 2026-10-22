\# Accessibility Statement — Dishari



Dishari is a Bangla-first multimodal accessibility research prototype designed to explore how digital tools can help people with visual disabilities access printed text, documents, and basic scene information.



\## Accessibility Goals



Dishari aims to support:



\- Reading printed Bangla and English text using OCR.

\- Listening to available text through device-supported text-to-speech.

\- Extracting text from supported PDF documents.

\- Using large-text and high-contrast display settings.

\- Navigating controls with a keyboard where supported.

\- Accessing camera-based scene descriptions and experimental object alerts.

\- Initiating a phone call through a user-confirmed emergency contact action.



\## Current Capabilities and Limitations



\- \*\*Bangla OCR:\*\* Uses Tesseract.js with Bengali and English language data. Accuracy depends on image quality, lighting, fonts, and document layout.

\- \*\*Text-to-speech:\*\* Depends on the browser, operating system, and available Bengali voices.

\- \*\*Voice commands:\*\* Recognition support varies by browser and device. Bangla recognition may require an online service.

\- \*\*Scene descriptions:\*\* Optional Gemini requests send user-selected images to Google for processing. AI-generated descriptions can be inaccurate.

\- \*\*Object alerts:\*\* Experimental single-image detection is not a substitute for a mobility aid, trained assistance, or safe navigation.

\- \*\*Emergency contact:\*\* The app does not automatically contact emergency services or share the user's location.



Dishari has not yet been established as compliant with WCAG through a formal accessibility audit.



\## Testing Priorities



Further testing should include:



\- Keyboard-only navigation and visible focus.

\- Screen-reader compatibility, including Android TalkBack.

\- Bengali text-to-speech pronunciation and reading controls.

\- Contrast, text resizing, and responsive layouts.

\- OCR accuracy across different Bangla fonts, lighting conditions, and document types.

\- Usability testing with consenting people with visual disabilities.



\## Feedback and Contributions



Users and contributors are encouraged to report accessibility barriers, browser compatibility issues, and suggestions through the repository's GitHub Issues page:



https://github.com/bananty-7/dishari-accessibility-assistant/issues



When reporting a problem, include the browser, device type, steps to reproduce it, and the expected behavior. Avoid posting personal documents, API keys, or sensitive images.



\## Important Notice



Dishari is a research prototype, not a certified assistive device. AI descriptions, OCR results, and experimental object alerts may be wrong. Users should not rely on these features alone for medication decisions, banknote authentication, or navigation safety.

