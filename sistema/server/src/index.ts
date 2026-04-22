import { createApp } from "./app";
import { QuestionRepository } from "./repository/questionRepository";

const PORT = Number(process.env.PORT ?? 4000);

const repo = new QuestionRepository();
const app = createApp(repo);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`server listening on http://localhost:${PORT}`);
});

