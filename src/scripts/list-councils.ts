import { getElectedCouncils } from "@/queries";

(async () => {
  const councils = await getElectedCouncils();
  console.log(councils);
})();
