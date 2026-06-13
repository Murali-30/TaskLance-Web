const { TextEncoder, TextDecoder } = require('util');

Object.assign(global, { TextDecoder, TextEncoder });
global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve({}) }));
global.Request = class Request {};
global.Headers = class Headers {};
global.Response = class Response {};

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}
