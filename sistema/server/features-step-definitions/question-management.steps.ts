import { DataTable, Given, Then, When } from "@cucumber/cucumber";

Given("the system is ready to manage questions", function () {
  return "pending";
});

Given(
  "a question exists with description {string} and the following alternatives:",
  function (_description: string, _alternatives: DataTable) {
    return "pending";
  }
);

When(
  "I create a question with description {string} and the following alternatives:",
  function (_description: string, _alternatives: DataTable) {
    return "pending";
  }
);

When("I list all questions", function () {
  return "pending";
});

When(
  "I update the question {string} to have description {string} and the following alternatives:",
  function (
    _oldDescription: string,
    _newDescription: string,
    _alternatives: DataTable
  ) {
    return "pending";
  }
);

When(
  "I delete the question with description {string}",
  function (_description: string) {
    return "pending";
  }
);

Then("the question should be created successfully", function () {
  return "pending";
});

Then(
  "listing questions should include a question with description {string}",
  function (_description: string) {
    return "pending";
  }
);

Then(
  "listing questions should not include a question with description {string}",
  function (_description: string) {
    return "pending";
  }
);

Then(
  "I should see a question with description {string}",
  function (_description: string) {
    return "pending";
  }
);

Then(
  "that question should have the following alternatives:",
  function (_alternatives: DataTable) {
    return "pending";
  }
);

