import { expect } from "vitest";
import matchers from "@testing-library/jest-dom/matchers";

// Додаємо додаткові matchers для роботи з DOM
expect.extend(matchers);