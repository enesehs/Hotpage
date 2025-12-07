# Contributing to HotPage

Thank you for your interest in contributing to HotPage! This document provides guidelines for contributing to the project.

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue on GitHub with:
- A clear description of the problem
- Steps to reproduce the issue
- Expected vs actual behavior
- Browser and version information
- Screenshots if applicable

### Suggesting Features

We welcome feature suggestions! Please open an issue with:
- A clear description of the feature
- Use cases and benefits
- Any implementation ideas you have

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
   - Follow the existing code style
   - Keep changes focused and minimal
   - Test your changes thoroughly
4. **Commit your changes**
   ```bash
   git commit -m "Add: brief description of changes"
   ```
5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Open a Pull Request**

## Development Guidelines

### Code Style

- **JavaScript**: Use modern ES6+ syntax
- **Naming**: Use camelCase for variables and functions
- **Comments**: Add comments for complex logic
- **Formatting**: Use 4 spaces for indentation
- **Functions**: Keep functions small and focused

### File Organization

- `index.html` - Main HTML structure
- `style.css` - All CSS styles
- `script.js` - All JavaScript functionality
- Keep the structure simple and maintainable

### Adding New Features

When adding a new widget or feature:

1. **HTML**: Add the widget markup in `index.html` within the `<main class="dashboard">` section
2. **CSS**: Add styles in `style.css` following the existing pattern
3. **JavaScript**: Add functionality in `script.js` with proper initialization
4. **localStorage**: Use localStorage for persistence if needed
5. **Documentation**: Update README.md with the new feature

### Testing

Before submitting a PR:

1. Test in multiple browsers (Chrome, Firefox, Safari, Edge)
2. Test on different screen sizes (desktop, tablet, mobile)
3. Verify localStorage persistence
4. Check console for errors
5. Test all existing features still work

### API Integration

When adding new API integrations:

1. **Prefer free APIs** that don't require API keys
2. **Use HTTPS** only
3. **Handle errors gracefully**
4. **Add rate limiting** if needed
5. **Document API source** in README

### Performance

- Keep the page lightweight and fast
- Minimize external dependencies
- Optimize images and assets
- Use efficient DOM manipulation

### Accessibility

- Use semantic HTML
- Ensure keyboard navigation works
- Add proper ARIA labels where needed
- Test with screen readers

## Questions?

If you have questions about contributing, feel free to open an issue for discussion.

## License

By contributing to HotPage, you agree that your contributions will be licensed under the MIT License.
