import { setWorldConstructor, World } from "@cucumber/cucumber";

export class CustomWorld extends World {
  // Phase 1: scaffold only. Add shared state here in later phases.
}

setWorldConstructor(CustomWorld);

