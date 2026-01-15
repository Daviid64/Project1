import { useParams } from "react-router-dom";
import Layout from "../layout/Layout.jsx";
import { metiers } from "../data/metiersData";

export default function MetierPage() {
  const { slug } = useParams();
  const metier = metiers[slug];

  if (!metier) {
    return <Layout><p>Métier introuvable</p></Layout>;
  }

  return (
    <Layout>
      <h1>{metier.title}</h1>

      <section>
        <h2>Description courte</h2>
        <p>{metier.descriptionCourte}</p>
      </section>

      <section>
        <h2>Missions principales</h2>
        <ul>
          {metier.missions.map((m, i) => <li key={i}>{m}</li>)}
        </ul>
      </section>

      <section>
        <h2>Compétences</h2>
        <p><strong>Techniques :</strong> {metier.competences.techniques}</p>
        <p><strong>Soft skills :</strong> {metier.competences.soft}</p>
      </section>

      <section>
        <h2>Outils</h2>
        <ul>
          {metier.outils.map((o, i) => <li key={i}>{o}</li>)}
        </ul>
      </section>

      <section>
        <h2>Perspectives</h2>
        <p>{metier.evolution}</p>
      </section>

      <section>
        <h2>Mots-clés SEO</h2>
        <p>{metier.seo}</p>
      </section>
    </Layout>
  );
}
