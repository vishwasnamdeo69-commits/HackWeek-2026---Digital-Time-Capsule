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
│   └── modal.js        # Modal open/close controller
├── assets/
│   ├── icons/
│   └── images/
├── screenshots/
├── README.md
└── LICENSE
```

## Phase 1 Features

- Premium responsive layout (header, hero, capsule grid)
- Three placeholder capsule cards
- Hidden empty state component
- Create Capsule modal (UI only)
- Modal open/close via button, overlay click, and ESC key

## Roadmap

| Phase | Focus |
|-------|-------|
| 1 | Foundation & UI |
| 2 | Create, validate, save, LocalStorage |
| 3 | Countdown, unlock logic, open capsule |
| 4 | Search, sort, filter, performance |
| 5 | Final polish, accessibility, docs |

## License

MIT — see [LICENSE](LICENSE).
