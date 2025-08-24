import type { ReactNode } from "react";
import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<"svg">>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: "Fast Setup",
    Svg: require("@site/static/img/undraw_docusaurus_mountain.svg").default,
    description: (
      <>
        Get started in minutes with zero config. Focus on your content, not
        boilerplate.
      </>
    ),
  },
  {
    title: "Content First",
    Svg: require("@site/static/img/undraw_docusaurus_tree.svg").default,
    description: (
      <>
        Keep your workflow clean — write Markdown or MDX, we’ll handle the
        modern web stack for you.
      </>
    ),
  },
  {
    title: "Built with React",
    Svg: require("@site/static/img/undraw_docusaurus_react.svg").default,
    description: (
      <>
        Extend and customize with React components, while staying in the
        Docusaurus ecosystem.
      </>
    ),
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx("col col--4", styles.cardWrapper)}>
      <div className={clsx("card", styles.cardModern)}>
        <div className="card__image text--center">
          <Svg className={styles.featureSvg} role="img" />
        </div>
        <div className="card__body text--center">
          <Heading as="h3">{title}</Heading>
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={clsx(styles.features, "py-12")}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
