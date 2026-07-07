# Digital Time Capsule

A beautiful web application where users can create digital memories — messages, notes, and images — that remain locked until a future date.

> **Phase 1:** Foundation & UI only. No data persistence or capsule logic yet.

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (ES Modules)

No frameworks. No libraries.

## Getting Started

1. Clone or download this repository.
2. Serve the project with any static file server (ES modules require HTTP):

   ```bash
   # Using Python
   python -m http.server 8080

   # Using Node (npx)
   npx serve .
   ```

3. Open `http://localhost:8080` in your browser.

Alternatively, open `index.html` directly in a browser that supports ES module file loading (Chrome, Firefox, Edge).

## Project Structure

```
digital-time-capsule/
├── index.html          # Main page
├── style.css           # Design system & styles
├── script.js           # App entry point
├── js/
│   ├── app.js          # Application orchestrator
│   ├── capsuleManager.js
│   ├── modal.js
│   ├── renderer.js
│   ├── storage.js
│   ├── utils.js
│   └── validator.js
├── assets/
│   ├── icons/
│   └── images/
├── screenshots/
├── README.md
└── LICENSE
```

## Phase 2 Features

- Create, edit, and delete capsules
- LocalStorage persistence (`digital-time-capsules`)
- Form validation with inline errors
- Cover image upload with Base64 storage and preview
- Dynamic card rendering with empty state toggle
- Custom delete confirmation modal

## Roadmap

| Phase | Focus |
|-------|-------|
| 1 | Foundation & UI |
| 2 | CRUD, validation, LocalStorage |
| 3 | Countdown, unlock logic, open capsule |
| 4 | Search, sort, filter, performance |
| 5 | Final polish, accessibility, docs |

## License

MIT — see [LICENSE](LICENSE).
