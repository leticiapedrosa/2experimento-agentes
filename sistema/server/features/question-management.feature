Feature: Question Management
  Managing exam questions with alternatives.
  Each question has a description and a list of alternatives.
  Each alternative has a description and a boolean isCorrect.

  Background:
    Given the system is ready to manage questions

  Scenario: Create a question with multiple alternatives
    When I create a question with description "What is 2 + 2?" and the following alternatives:
      | description | isCorrect |
      | 3           | false     |
      | 4           | true      |
      | 5           | false     |
      | IV          | true      |
    Then the question should be created successfully
    And listing questions should include a question with description "What is 2 + 2?"
    And that question should have the following alternatives:
      | description | isCorrect |
      | 3           | false     |
      | 4           | true      |
      | 5           | false     |
      | IV          | true      |

  Scenario: List questions
    Given a question exists with description "Capital of France?" and the following alternatives:
      | description | isCorrect |
      | Paris       | true      |
      | Lyon        | false     |
      | Berlin      | false     |
    When I list all questions
    Then I should see a question with description "Capital of France?"

  Scenario: Update a question (description and alternatives)
    Given a question exists with description "What is 2 + 2?" and the following alternatives:
      | description | isCorrect |
      | 3           | false     |
      | 4           | true      |
      | 5           | false     |
      | IV          | true      |
    When I update the question "What is 2 + 2?" to have description "What is 3 + 3?" and the following alternatives:
      | description | isCorrect |
      | 5           | false     |
      | 6           | true      |
      | 7           | false     |
      | VI          | true      |
    Then listing questions should include a question with description "What is 3 + 3?"
    And listing questions should not include a question with description "What is 2 + 2?"
    And that question should have the following alternatives:
      | description | isCorrect |
      | 5           | false     |
      | 6           | true      |
      | 7           | false     |
      | VI          | true      |

  Scenario: Delete a question
    Given a question exists with description "To be deleted" and the following alternatives:
      | description | isCorrect |
      | yes         | true      |
      | no          | false     |
    When I delete the question with description "To be deleted"
    Then listing questions should not include a question with description "To be deleted"

