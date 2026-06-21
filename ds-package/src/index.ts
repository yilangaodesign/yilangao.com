// ── Tier 1 — Core Primitives ─────────────────────────────────────────────────
export { Button } from "../../src/components/ui/Button";
export type {
  ButtonProps,
  ButtonAppearance,
  ButtonEmphasis,
  ButtonSize,
  ButtonShape,
} from "../../src/components/ui/Button";

export { ButtonGroup } from "../../src/components/ui/ButtonGroup";
export type {
  ButtonGroupProps,
  ButtonGroupOrientation,
  ButtonGroupAlign,
  ButtonGroupSpacing,
} from "../../src/components/ui/ButtonGroup";

export { Card, CardHeader, CardBody, CardFooter } from "../../src/components/ui/Card";
export type { CardProps, CardSectionProps, CardVariant } from "../../src/components/ui/Card";

export { Badge } from "../../src/components/ui/Badge";
export type {
  BadgeProps,
  BadgeAppearance,
  BadgeEmphasis,
  BadgeSize,
  BadgeShape,
} from "../../src/components/ui/Badge";

export { BadgeOverlay, BadgeOverlayAnchor } from "../../src/components/ui/BadgeOverlay";
export type {
  BadgeOverlayProps,
  BadgeOverlayAnchorProps,
  BadgeOverlayAppearance,
  BadgeOverlayStatus,
  BadgeOverlayEmphasis,
  BadgeOverlaySize,
  BadgeOverlayPlacement,
} from "../../src/components/ui/BadgeOverlay";

export { TextRow } from "../../src/components/ui/TextRow";
export type {
  TextRowProps,
  TextRowSize,
  TextRowEmphasis,
  TextRowElement,
} from "../../src/components/ui/TextRow";

export { Eyebrow } from "../../src/components/ui/Eyebrow";
export type {
  EyebrowProps,
  EyebrowSize,
  EyebrowEmphasis,
  EyebrowElement,
} from "../../src/components/ui/Eyebrow";

export { Divider } from "../../src/components/ui/Divider";
export type { DividerProps, DividerOrientation } from "../../src/components/ui/Divider";

export { Avatar } from "../../src/components/ui/Avatar";
export type { AvatarProps, AvatarSize } from "../../src/components/ui/Avatar";

// ── Tier 2 — Form Components ────────────────────────────────────────────────
export { Input } from "../../src/components/ui/Input";
export type { InputProps } from "../../src/components/ui/Input";

export { Textarea } from "../../src/components/ui/Textarea";
export type { TextareaProps } from "../../src/components/ui/Textarea";

export { Select, SelectItem, SelectGroup, SelectLabel, SelectSeparator } from "../../src/components/ui/Select";
export type { SelectProps, SelectItemProps } from "../../src/components/ui/Select";

export { Checkbox } from "../../src/components/ui/Checkbox";
export type {
  CheckboxAppearance,
  CheckboxCheckedState,
  CheckboxLabelPlacement,
  CheckboxProps,
  CheckboxSize,
} from "../../src/components/ui/Checkbox";

export { Toggle } from "../../src/components/ui/Toggle";
export type { ToggleProps } from "../../src/components/ui/Toggle";

export {
  Menu,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  MenuHeader,
  MenuFooter,
} from "../../src/components/ui/Menu";
export type {
  MenuSize,
  MenuAppearance,
  MenuProps,
  MenuItemProps,
  MenuLabelProps,
  MenuHeaderProps,
  MenuFooterProps,
} from "../../src/components/ui/Menu";

// ── Tier 3 — Overlay & Disclosure ───────────────────────────────────────────
export { Tooltip, TooltipProvider, InfoTooltip } from "../../src/components/ui/Tooltip";
export type { TooltipProps, TooltipSize, TooltipAppearance, InfoTooltipProps, InfoTooltipContextSize } from "../../src/components/ui/Tooltip";

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../../src/components/ui/Dialog";
export type { DialogContentProps } from "../../src/components/ui/Dialog";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuRadioGroup,
} from "../../src/components/ui/DropdownMenu";
export type { DropdownMenuContentProps, DropdownMenuItemProps } from "../../src/components/ui/DropdownMenu";

export { Tabs, TabsList, TabsTrigger, TabsContent } from "../../src/components/ui/Tabs";

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
} from "../../src/components/ui/Toast";
export type { ToastProps, ToastVariant } from "../../src/components/ui/Toast";

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "../../src/components/ui/AlertDialog";
export type { AlertDialogContentProps } from "../../src/components/ui/AlertDialog";

// ── Tier 4 — Extended Primitives ────────────────────────────────────────────
export { ColorPicker } from "../../src/components/ui/ColorPicker";
export type { ColorPickerProps } from "../../src/components/ui/ColorPicker";

export { Slider } from "../../src/components/ui/Slider";
export type { SliderProps } from "../../src/components/ui/Slider";

export { ScrubInput } from "../../src/components/ui/ScrubInput";
export type { ScrubInputProps } from "../../src/components/ui/ScrubInput";

export { Dropzone } from "../../src/components/ui/Dropzone";
export type { DropzoneProps } from "../../src/components/ui/Dropzone";

export { ProgressBar } from "../../src/components/ui/ProgressBar";
export type { ProgressBarProps } from "../../src/components/ui/ProgressBar";

export { ButtonSelect, ButtonSelectItem } from "../../src/components/ui/ButtonSelect";
export type {
  ButtonSelectProps,
  ButtonSelectItemProps,
  ButtonSelectAppearance,
  ButtonSelectEmphasis,
  ButtonSelectSize,
} from "../../src/components/ui/ButtonSelect";

export { CodeBlock } from "../../src/components/ui/CodeBlock";
export type { CodeBlockProps } from "../../src/components/ui/CodeBlock";

// ── Tier 5 — Navigation & Layout ────────────────────────────────────────────
export { NavItem } from "../../src/components/ui/NavItem";
export type { NavItemProps, NavItemBaseProps } from "../../src/components/ui/NavItem";

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
} from "../../src/components/ui/Sheet";
export type { SheetContentProps, SheetSide } from "../../src/components/ui/Sheet";

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../src/components/ui/Table";
export type { TableCellProps } from "../../src/components/ui/Table";

export {
  DataGrid,
  DataGridCell,
  TextCell,
  MultiLineTextCell,
  ProgressCell,
  BadgeCell,
  ButtonCell,
  InputCell,
  SlotCell,
} from "../../src/components/ui/DataGrid";
export type {
  DataGridProps,
  DataGridSize,
  DataGridDensity,
  DataGridAlign,
  DataGridCellContent,
  DataGridCellStatus,
  DataGridCellBackground,
  DataGridColumnMeta,
  DataGridCellProps,
} from "../../src/components/ui/DataGrid";

export { InlineCode } from "../../src/components/ui/InlineCode";
export type { InlineCodeProps } from "../../src/components/ui/InlineCode";

export {
  CommandMenu,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "../../src/components/ui/CommandMenu";
export type { CommandMenuProps, CommandInputProps, CommandGroupProps, CommandItemProps } from "../../src/components/ui/CommandMenu";

export { Kbd } from "../../src/components/ui/Kbd";
export type { KbdProps, KbdSize } from "../../src/components/ui/Kbd";

export { DescriptionList, DescriptionItem } from "../../src/components/ui/DescriptionList";
export type { DescriptionListProps, DescriptionItemProps } from "../../src/components/ui/DescriptionList";

export {
  VerticalNav,
  VerticalNavProvider,
  VerticalNavHeader,
  VerticalNavContent,
  VerticalNavSection,
  VerticalNavGroup,
  VerticalNavCategory,
  VerticalNavFooter,
  VerticalNavSliver,
  VerticalNavSliverRegistry,
  useVerticalNav,
  VERTICAL_NAV_WIDTH_EXPANDED,
  VERTICAL_NAV_WIDTH_COLLAPSED,
} from "../../src/components/ui/VerticalNav";
export type {
  VerticalNavProps,
  VerticalNavProviderProps,
  VerticalNavHeaderProps,
  VerticalNavContentProps,
  VerticalNavSectionProps,
  VerticalNavGroupProps,
  VerticalNavCategoryProps,
  VerticalNavFooterProps,
  VerticalNavSliverProps,
} from "../../src/components/ui/VerticalNav";

export { MediaMuteToggle } from "../../src/components/ui/MediaMuteToggle";
export type { MediaMuteToggleProps, MediaMuteToggleSize } from "../../src/components/ui/MediaMuteToggle";

export { VideoEmbed } from "../../src/components/ui/VideoEmbed";
export type { VideoEmbedProps } from "../../src/components/ui/VideoEmbed";

// ── Tier 6 — Animation & Theme (publishable subset) ────────────────────────
// Excludes: TestimonialCard, Navigation, Footer, ScrollSpy (site-specific)
export { ArrowReveal } from "../../src/components/ui/ArrowReveal";
export { ExpandCollapse } from "../../src/components/ui/ExpandCollapse";
export { FadeIn } from "../../src/components/ui/FadeIn";
export { MountEntrance } from "../../src/components/ui/MountEntrance";
export { StaggerChildren, StaggerItem } from "../../src/components/ui/StaggerChildren";
export { Marquee } from "../../src/components/ui/Marquee";
export { ThemeProvider } from "../../src/components/ui/ThemeProvider";
export { ThemeToggle } from "../../src/components/ui/ThemeToggle";

// ── Tier 7 — Data Visualization ─────────────────────────────────────────────
export { Canvas } from "../../src/components/ui/Canvas";
export type { CanvasProps, CanvasTransform } from "../../src/components/ui/Canvas";

export { ForceGraph } from "../../src/components/ui/ForceGraph";
export type {
  ForceGraphProps,
  ForceGraphNode,
  ForceGraphLink,
  ForceGraphTransform,
} from "../../src/components/ui/ForceGraph";

export { CanvasToolbar } from "../../src/components/ui/CanvasToolbar";
export type {
  CanvasToolbarProps,
  CanvasToolbarItem,
} from "../../src/components/ui/CanvasToolbar";

// ── Motion constants ────────────────────────────────────────────────────────
export {
  DURATION,
  EASING,
  TRANSITION_ENTER,
  TRANSITION_STAGGER_ITEM,
  TRANSITION_EXPAND,
  TRANSITION_INDICATOR,
  TRANSITION_HOVER_SCALE,
  STAGGER_INTERVAL,
  ENTRANCE_Y,
  REDUCED_MOTION_QUERY,
  getReducedTransition,
} from "../../src/components/ui/_shared/motion";
