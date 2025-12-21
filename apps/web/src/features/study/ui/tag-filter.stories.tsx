import type { Meta, StoryObj } from "@storybook/react";
import { TagFilter } from "./tag-filter";
import { useState } from "react";

const meta: Meta<typeof TagFilter> = {
  title: "Features/Study/TagFilter",
  component: TagFilter,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="p-4 bg-background max-w-md">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TagFilter>;

const sampleTags = [
  { tag: "알고리즘", count: 15 },
  { tag: "코딩테스트", count: 12 },
  { tag: "JAVA", count: 10 },
  { tag: "Python", count: 8 },
  { tag: "CS", count: 5 },
];

export const Default: Story = {
  args: {
    tags: sampleTags,
    selectedTags: [],
    onTagToggle: () => {},
  },
};

export const WithSelection: Story = {
  args: {
    tags: sampleTags,
    selectedTags: ["알고리즘", "JAVA"],
    onTagToggle: () => {},
  },
};

export const Loading: Story = {
  args: {
    tags: [],
    selectedTags: [],
    onTagToggle: () => {},
    isLoading: true,
  },
};

export const Empty: Story = {
  args: {
    tags: [],
    selectedTags: [],
    onTagToggle: () => {},
  },
};

export const Interactive: Story = {
  render: function Render() {
    const [selected, setSelected] = useState<string[]>([]);
    return (
      <TagFilter
        tags={sampleTags}
        selectedTags={selected}
        onTagToggle={(tag) => {
          if (selected.includes(tag)) {
            setSelected(selected.filter((t) => t !== tag));
          } else {
            setSelected([...selected, tag]);
          }
        }}
      />
    );
  },
};
