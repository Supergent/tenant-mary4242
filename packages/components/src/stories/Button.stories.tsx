import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../button";

const meta = {
  title: "Primitives/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "subtle", "ghost", "destructive"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "icon"],
    },
  },
  args: {
    children: "Click me",
    variant: "primary",
    size: "md",
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {};
export const Secondary: Story = { args: { variant: "secondary" } };
export const Destructive: Story = { args: { variant: "destructive" } };
