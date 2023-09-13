import { getCouncilBudget, getElectedCouncilById } from "@/queries";

async function generateReport() {
  const councilId = "0000000i";
  const council = await getElectedCouncilById(councilId);
  const councilBudget = await getCouncilBudget(council);
  console.log(councilBudget);
}

generateReport();
