import type { Preview } from "@storybook/react";
import "../src/styles.css";

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "surface",
      values: [
        { name: "surface", value: "var(--color-surface)" },
        { name: "muted", value: "var(--color-muted)" },
      ],
    },
  },
};

export default preview;
