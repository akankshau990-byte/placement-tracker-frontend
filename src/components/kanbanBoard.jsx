mport React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import axios from "axios";
import { toast } from "react-toastify";

// Schema Enums ke sath exact match
const COLUMNS = ["Applied", "Interviewing", "Selected", "Rejected"];

const KanbanBoard = ({ applications, setApplications, backendUrl, token }) => {
  const [boardData, setBoardData] = useState({});

  useEffect(() => {
    const categorized = COLUMNS.reduce((acc, col) => {
      acc[col] = applications.filter((app) => app.status === col);
      return acc;
    }, {});
    setBoardData(categorized);
  }, [applications]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const destCol = destination.droppableId;

    // Optimistic UI Update (Instant drag display)
    const updatedApps = applications.map((app) =>
      app._id === draggableId ? { ...app, status: destCol } : app
    );
    setApplications(updatedApps);

    // Sync status change with Database
    try {
      await axios.patch(
        `${backendUrl}/api/applications/${draggableId}/status`,
        { status: destCol },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Status updated to ${destCol}`);
    } catch (error) {
      toast.error("Failed to update status");
      setApplications(applications); // Rollback on error
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
        {COLUMNS.map((col) => (
          <Droppable droppableId={col} key={col}>
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="bg-gray-100 p-3 rounded-lg min-h-[450px]"
              >
                <h3 className="font-bold text-gray-700 mb-3 text-center border-b pb-2">
                  {col} ({boardData[col]?.length || 0})
                </h3>
                {boardData[col]?.map((app, index) => (
                  <Draggable key={app._id} draggableId={app._id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="bg-white p-3 rounded shadow mb-2 hover:shadow-md transition cursor-grab active:cursor-grabbing border-l-4 border-blue-500"
                      >
                        <h4 className="font-semibold text-gray-800">
                          {app.companyName}
                        </h4>
                        <p className="text-sm text-gray-600">{app.role}</p>
                        {app.notes && (
                          <p className="text-xs text-gray-400 mt-1 italic truncate">
                            {app.notes}
                          </p>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;