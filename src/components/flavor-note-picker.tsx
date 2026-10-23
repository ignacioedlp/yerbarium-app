import { tr, useLocale } from "@/i18n";
import { Pressable, Text, View } from "react-native";
import { flavorFamilies, type FlavorNote } from "@/api/community-types";
import { Body } from "@/components/ui";
import { useTheme } from "@/theme";

export function FlavorNotePicker({
  notes,
  selected,
  onToggle,
  disabled = false,
}: {
  notes: FlavorNote[];
  selected: string[];
  onToggle: (slug: string) => void;
  disabled?: boolean;
}) {
  const t = useTheme();
  useLocale();
  const uniqueNotes = [
    ...new Map(notes.map((note) => [note.slug, note])).values(),
  ];
  const groups = Object.entries(flavorFamilies).map(([family, label]) => ({
    family,
    label,
    notes: uniqueNotes.filter((note) => note.family === family),
  }));
  groups.push({
    family: "OTHER",
    label: "Otras notas",
    notes: uniqueNotes.filter((note) => !flavorFamilies[note.family]),
  });
  if (!uniqueNotes.length)
    return (
      <Body muted>
        {tr("Todavía no hay notas disponibles para seleccionar.")}
      </Body>
    );
  return (
    <View style={{ gap: t.spacing.lg }}>
      {groups
        .filter((group) => group.notes.length)
        .map((group) => (
          <View key={group.family} style={{ gap: t.spacing.sm }}>
            <Text
              accessibilityRole="header"
              style={{
                fontFamily: t.fonts.bold,
                fontSize: 18,
                color: t.colors.ink,
              }}
            >
              {tr(group.label)}
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: t.spacing.sm,
              }}
            >
              {group.notes.map((note) => {
                const checked = selected.includes(note.slug);
                return (
                  <Pressable
                    key={note.slug}
                    accessibilityRole="checkbox"
                    accessibilityLabel={`${tr(note.name)}, ${tr(group.label)}`}
                    accessibilityState={{ checked, disabled }}
                    disabled={disabled}
                    onPress={() => onToggle(note.slug)}
                    style={({ pressed }) => ({
                      minHeight: 44,
                      maxWidth: "100%",
                      paddingHorizontal: t.spacing.md,
                      paddingVertical: t.spacing.sm,
                      justifyContent: "center",
                      borderRadius: t.radius.pill,
                      borderWidth: 1,
                      borderColor: checked ? t.colors.green : t.colors.border,
                      backgroundColor: checked
                        ? t.colors.selected
                        : t.colors.surface,
                      opacity: disabled ? 0.45 : pressed ? 0.65 : 1,
                    })}
                  >
                    <Text
                      style={{
                        fontFamily: checked ? t.fonts.bold : t.fonts.body,
                        fontSize: 16,
                        color: t.colors.ink,
                      }}
                    >
                      {checked ? "✓ " : "+ "}
                      {tr(note.name)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
    </View>
  );
}
