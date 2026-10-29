import React, { useState, useEffect } from "react";
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
      app._id === draggableId ? { ...app, status: destCol } : app,
    );
    setApplications(updatedApps);

    // Sync status change with Database
    try {
      await axios.patch(
        `${backendUrl}/api/applications/${draggableId}/status`,
        { status: destCol },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success(`Status updated to ${destCol}`);
    } catch (error) {
      toast.error("Failed to update status");
      setApplications(applications); // Rollback on error
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="row g-3 p-2">
        {COLUMNS.map((col) => (
          <div className="col-12 col-md-3" key={col}>
            <Droppable droppableId={col}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="bg-light p-3 rounded shadow-sm"
                  style={{ minHeight: "500px" }}
                >
                  <h5 className="fw-bold text-secondary mb-3 text-center border-bottom pb-2">
                    {col} ({boardData[col]?.length || 0})
                  </h5>
                  {boardData[col]?.map((app, index) => (
                    <Draggable
                      key={app._id}
                      draggableId={app._id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white p-3 rounded shadow-sm mb-3 border-start border-4 border-primary"
                          style={{
                            cursor: "grab",
                            ...provided.draggableProps.style,
                          }}
                        >
                          <h6 className="fw-bold text-dark mb-1">
                            {app.companyName}
                          </h6>
                          <p className="text-muted small mb-1">{app.role}</p>
                          {app.notes && (
                            <p
                              className="text-secondary small mt-2 mb-0 italic text-truncate"
                              title={app.notes}
                            >
                              📝 {app.notes}
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
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
