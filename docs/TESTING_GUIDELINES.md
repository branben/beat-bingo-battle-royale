# Testing Guidelines

## Table of Contents
1. [Testing Principles](#testing-principles)
2. [Test Types](#test-types)
3. [Test Structure](#test-structure)
4. [Testing Components](#testing-components)
5. [Testing Hooks](#testing-hooks)
6. [Testing API Calls](#testing-api-calls)
7. [Testing User Interactions](#testing-user-interactions)
8. [Test Coverage](#test-coverage)
9. [Best Practices](#best-practices)
10. [Common Patterns](#common-patterns)
11. [Debugging Tests](#debugging-tests)

## Testing Principles

1. **Write Tests First**
   - Follow Test-Driven Development (TDD) when possible
   - Write tests before or alongside implementation
   - Tests should drive the design of your code

2. **Test Behavior, Not Implementation**
   - Focus on what the code does, not how it does it
   - Avoid testing implementation details
   - Tests should be resilient to refactoring

3. **Keep Tests Isolated**
   - Each test should be independent
   - Mock external dependencies
   - Reset state between tests

## Test Types

### Unit Tests
- Test individual functions or components in isolation
- Fast and focused
- Should not make real API calls

### Integration Tests
- Test how multiple units work together
- Can include API calls with mocks
- Focus on component interactions

### End-to-End (E2E) Tests
- Test complete user flows
- Run against a real browser
- Use Playwright for browser automation

## Test Structure

### File Naming
- Test files should be named with `.test.ts` or `.test.tsx` extension
- Place test files next to the code they test or in a `__tests__` directory
- Example: `Button.tsx` → `Button.test.tsx`

### Test Organization
```typescript
describe('ComponentName', () => {
  // Setup code here
  
  describe('when [some condition]', () => {
    // Test cases for specific condition
    
    it('should [expected behavior]', () => {
      // Test implementation
    });
  });
});
```

## Testing Components

### Rendering Tests
```typescript
import { render, screen } from '@/test/test-utils';
import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### User Interaction Tests
```typescript
import { render, screen, userEvent } from '@/test/test-utils';
import { Counter } from './Counter';

describe('Counter', () => {
  it('increments count when clicked', async () => {
    render(<Counter />);
    const button = screen.getByRole('button', { name: /count/i });
    
    await userEvent.click(button);
    
    expect(button).toHaveTextContent('1');
  });
});
```

## Testing Hooks

### Custom Hook Test
```typescript
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('increments count', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
});
```

## Testing API Calls

### Mocking API Calls
```typescript
import { server } from '@/test/mocks/server';
import { rest } from 'msw';
import { render, screen, waitFor } from '@/test/test-utils';
import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
  it('displays user data', async () => {
    server.use(
      rest.get('/api/user', (req, res, ctx) => {
        return res(
          ctx.json({ name: 'John Doe', email: 'john@example.com' })
        );
      })
    );
    
    render(<UserProfile userId="123" />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});
```

## Testing User Interactions

### Form Submission
```typescript
import { render, screen, waitFor } from '@/test/test-utils';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('submits the form with email and password', async () => {
    const handleSubmit = vi.fn();
    render(<LoginForm onSubmit={handleSubmit} />);
    
    const email = 'test@example.com';
    const password = 'password123';
    
    await userEvent.type(screen.getByLabelText(/email/i), email);
    await userEvent.type(screen.getByLabelText(/password/i), password);
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        email,
        password,
      });
    });
  });
});
```

## Test Coverage

### Coverage Requirements
- Aim for 90%+ test coverage
- Focus on business logic and critical paths
- Don't chase 100% coverage at the cost of test quality

### Running Coverage
```bash
# Run tests with coverage
npm test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

## Best Practices

1. **Test Naming**
   - Use descriptive test names
   - Follow the pattern: "should [expected behavior] when [state/context]"
   - Example: `should display error message when submission fails`

2. **Test Data**
   - Use test data factories
   - Keep test data close to tests
   - Use realistic data

3. **Async Testing**
   - Always wait for async operations to complete
   - Use `waitFor` for DOM updates
   - Handle loading and error states

4. **Accessibility**
   - Test with screen readers in mind
   - Use semantic HTML
   - Test keyboard navigation

## Common Patterns

### Mocking Modules
```typescript
vi.mock('@/lib/api', () => ({
  fetchUser: vi.fn(() => Promise.resolve({ name: 'Mock User' })),
}));
```

### Testing Context
```typescript
const wrapper = ({ children }) => (
  <UserProvider>
    {children}
  </UserProvider>
);

const { result } = renderHook(() => useUser(), { wrapper });
```

### Testing Error Boundaries
```typescript
// Silence console.error for expected errors
const originalError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});

afterAll(() => {
  console.error = originalError;
});
```

## Debugging Tests

### Debug Output
```typescript
// Print the rendered component
screen.debug();

// Print only part of the component
screen.debug(screen.getByRole('button'));

// Print the document
console.log(prettyDOM());
```

### Playground Mode
```bash
# Run tests in watch mode
npm test -- --watch

# Run a specific test file
npm test -- path/to/test.file.tsx

# Run in UI mode
npm run test:ui
```

### Debugging Tips
1. Use `screen.debug()` to inspect the rendered output
2. Use `--no-watch` flag to prevent watch mode
3. Add `debugger` statements and run tests with `--inspect-brk`
4. Use `getBy*` queries for elements that must exist, `queryBy*` for optional elements

## Testing Audio Features

### Mocking Audio Elements
```typescript
// In test setup
window.HTMLMediaElement.prototype.play = vi.fn();
window.HTMLMediaElement.prototype.pause = vi.fn();

// In test
const playStub = vi.spyOn(window.HTMLMediaElement.prototype, 'play');
const pauseStub = vi.spyOn(window.HTMLMediaElement.prototype, 'pause');

expect(playStub).toHaveBeenCalled();
```

### Testing Audio Playback
```typescript
it('plays audio when play button is clicked', async () => {
  const playStub = vi.spyOn(window.HTMLMediaElement.prototype, 'play');
  
  render(<AudioPlayer src="test.mp3" />);
  
  await userEvent.click(screen.getByRole('button', { name: /play/i }));
  
  expect(playStub).toHaveBeenCalled();
});
```

## Testing Real-time Features

### Mocking WebSockets
```typescript
// In test setup
const mockSocket = {
  on: vi.fn(),
  emit: vi.fn(),
  disconnect: vi.fn(),
};

vi.mock('socket.io-client', () => ({
  io: () => mockSocket,
}));

// In test
it('receives real-time updates', () => {
  const { result } = renderHook(() => useRealTimeUpdates());
  
  // Simulate server message
  const messageHandler = mockSocket.on.mock.calls[0][1];
  messageHandler({ data: 'test' });
  
  expect(result.current.data).toBe('test');
});
```

## Performance Testing

### Testing with Virtual Timer
```typescript
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it('debounces search input', () => {
  const onSearch = vi.fn();
  render(<Search onSearch={onSearch} />);
  
  const input = screen.getByPlaceholderText('Search...');
  
  // Simulate typing
  userEvent.type(input, 'test');
  
  // Fast-forward time
  vi.advanceTimersByTime(300);
  
  expect(onSearch).toHaveBeenCalledWith('test');
});
```

## Accessibility Testing

### Testing with jest-axe
```typescript
import { axe } from 'jest-axe';

it('has no accessibility violations', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Continuous Integration

### GitHub Actions
- Tests run on every push and PR
- Required to pass before merging
- Coverage reports uploaded to Codecov

### Local Pre-commit Hooks
- Linting
- Type checking
- Unit tests

## Resources

- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest](https://vitest.dev/)
- [MSW](https://mswjs.io/)
- [Playwright](https://playwright.dev/)
- [Testing Library Cheatsheet](https://testing-library.com/docs/dom-testing-library/cheatsheet/)
