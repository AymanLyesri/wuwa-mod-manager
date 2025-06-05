import React, { useState, useEffect } from "react";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { Mod } from "../interfaces/Mod.interface";
import { Preset } from "../interfaces/Preset.interface";
import { STYLE, COLORS } from "../constants/styling.constant";
import { v4 as uuidv4 } from "uuid";
import {
  savePreset,
  getPresets,
  deletePreset,
  applyPreset,
} from "../services/preset.service";

interface PresetProps {
  mods: Mod[];
  onApplyPreset: (modIds: string[]) => void;
  modDirPath?: string;
}

const PresetComponent: React.FC<PresetProps> = ({
  mods,
  onApplyPreset,
  modDirPath,
}) => {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [newPresetName, setNewPresetName] = useState("");
  const [newPresetDescription, setNewPresetDescription] = useState("");

  useEffect(() => {
    if (modDirPath) {
      loadPresets();
    }
  }, [modDirPath]);

  const loadPresets = async () => {
    if (!modDirPath) return;
    try {
      console.log("Loading presets from:", modDirPath);
      const loadedPresets = await getPresets(modDirPath);
      setPresets(loadedPresets);
    } catch (error) {
      console.error("Error loading presets:", error);
    }
  };

  const createPreset = async () => {
    if (!newPresetName.trim() || !modDirPath) return;

    const enabledModIds = mods
      .filter((mod) => mod.enabled)
      .map((mod) => mod.id);
    const newPreset: Preset = {
      id: uuidv4(),
      name: newPresetName.trim(),
      description: newPresetDescription.trim() || undefined,
      modIds: enabledModIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await savePreset(modDirPath, newPreset);
      await loadPresets();
      setNewPresetName("");
      setNewPresetDescription("");
    } catch (error) {
      console.error("Error creating preset:", error);
    }
  };

  const handleDeletePreset = async (presetId: string) => {
    if (!modDirPath) return;
    try {
      await deletePreset(modDirPath, presetId);
      await loadPresets();
    } catch (error) {
      console.error("Error deleting preset:", error);
    }
  };

  const handleApplyPreset = async (preset: Preset) => {
    if (!modDirPath) return;
    try {
      await applyPreset(modDirPath, preset.id);
      onApplyPreset(preset.modIds);
    } catch (error) {
      console.error("Error applying preset:", error);
    }
  };

  const handleUpdatePreset = async (preset: Preset) => {
    if (!modDirPath) return;
    const enabledModIds = mods
      .filter((mod) => mod.enabled)
      .map((mod) => mod.id);
    const updatedPreset = {
      ...preset,
      modIds: enabledModIds,
      updatedAt: new Date().toISOString(),
    };

    try {
      await savePreset(modDirPath, updatedPreset);
      await loadPresets();
    } catch (error) {
      console.error("Error updating preset:", error);
    }
  };

  return (
    <div className={STYLE.flex.center}>
      <Popover className="relative">
        <PopoverButton className={STYLE.button.secondary}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>Presets</span>
        </PopoverButton>

        <PopoverPanel
          className={`
          absolute z-10 right-0 mt-2 w-96 
          rounded-xl border ${COLORS.border.panel}
          ${COLORS.background.popover} ${COLORS.shadow.panel}
          ${STYLE.flex.column} gap-5
          p-4 space-y-4
        `}
        >
          {/* Create New Preset Section */}
          <div>
            <label className={STYLE.text.label}>Create New Preset</label>
            <input
              type="text"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              placeholder="Preset name"
              className={STYLE.input + " w-full"}
            />
            <textarea
              value={newPresetDescription}
              onChange={(e) => setNewPresetDescription(e.target.value)}
              placeholder="Description (optional)"
              className={STYLE.input + " w-full resize-none"}
              rows={2}
            />
            <button
              onClick={createPreset}
              disabled={!newPresetName.trim()}
              className={`${STYLE.button.primary} w-full ${
                !newPresetName.trim() ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Create Preset from Enabled Mods
            </button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${COLORS.border.panel}`} />
            </div>
            <div className="relative flex justify-center">
              <span
                className={`px-2 ${COLORS.background.panel} text-sm ${COLORS.text.secondary}`}
              >
                Saved Presets
              </span>
            </div>
          </div>

          {/* Presets List */}
          <div>
            {presets.length === 0 ? (
              <p className={STYLE.text.caption + " text-center"}>
                No presets saved yet
              </p>
            ) : (
              presets.map((preset) => (
                <div
                  key={preset.id}
                  className={`
                    ${STYLE.card} space-y-2
                    hover:shadow-lg hover:shadow-neutral-200/20 dark:hover:shadow-black/40
                    transition-all duration-300
                  `}
                >
                  <div className={STYLE.flex.between}>
                    <h3 className={STYLE.text.heading}>{preset.name}</h3>
                    <div className={STYLE.flex.center + " gap-2"}>
                      <button
                        onClick={() => handleUpdatePreset(preset)}
                        className={STYLE.button.icon + " text-emerald-500"}
                        title="Update preset with current enabled mods"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeletePreset(preset.id)}
                        className={STYLE.button.icon + " text-red-500"}
                        title="Delete preset"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {preset.description && (
                    <p className={STYLE.text.body}>{preset.description}</p>
                  )}
                  <div className={STYLE.flex.between}>
                    <span className={STYLE.text.caption}>
                      {preset.modIds.length} mods
                    </span>
                    <button
                      onClick={() => handleApplyPreset(preset)}
                      className={STYLE.button.secondary}
                    >
                      Apply Preset
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </PopoverPanel>
      </Popover>
    </div>
  );
};

export default PresetComponent;
