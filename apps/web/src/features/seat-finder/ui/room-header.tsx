import { RoomHeaderProps } from "@/entities/room";

export const RoomHeader = ({ roomName }: RoomHeaderProps) => {
  return (
    <h3 className="text-xl font-light text-foreground group-hover:text-muted-foreground transition-colors duration-300">
      {roomName}
    </h3>
  );
};
