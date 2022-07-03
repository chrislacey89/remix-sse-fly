import { useLocalStorage } from "@mantine/hooks";

const themes = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
];

export default function DropDown() {
  const [selectedTheme, setSelectedTheme] = useLocalStorage({
    key: "chat-theme",
  });

  return (
    <div className="dropdown">
      <label tabIndex={0} className="btn m-1">
        Theme: {selectedTheme}
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content menu rounded-box w-52 bg-base-100 p-2 shadow"
      >
        {themes.map((theme) => (
          <li
            key={theme}
            onClick={(e) => {
              e.preventDefault();
              setSelectedTheme(theme);
            }}
            value="item1"
          >
            <a href="/">{theme}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
