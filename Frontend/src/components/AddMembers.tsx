import React, { useState } from "react";

interface AddMembersProps {
  person: string;
  onAddPerson: (person: string) => void;
  onClose: () => void;
}

export const AddMembers : React.FC<AddMembersProps> = ({person, onAddPerson, onClose}) => {
    const [personState, setPersonState] = useState<string>(person);
  return (
    <div className="modal-overlay">
      <div className="modal-content  p-8 bg-zinc-200 w-[26vw] rounded-md space-y-8 ">
        <div className="modal-header flex justify-between">
          <h2 className="text-2xl font-semibold">Add a Member</h2>
          <button
            className="close-button w-7 h-7 font-semibold bg-zinc-300 rounded-full "
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form onSubmit={(e) => {
            e.preventDefault();
            console.log(personState);
            
            onAddPerson(personState);
        }} className="task-form flex flex-col gap-4">
          

          <div className="form-group flex flex-col gap-3 ">
            <label htmlFor="description " className="font-semibold">
              Member Name
            </label>
            <input
              id="description"
              value={personState}
              onChange={(e) => setPersonState(e.target.value)}
              placeholder="Enter member name"
              className="outline-none border-2 border-zinc-400 h-30 px-3 py-2 rounded-lg resize-none "
              required
            />
          </div>

          <div className="form-actions flex flex-row-reverse gap-3 ">
            <button
              type="submit"
              className="submit-button px-4 py-2 rounded-md bg-black text-white "
              disabled={personState.length <= 0}
            >
              Add Member
            </button>
            <button
              type="button"
              className="cancel-button px-4 py-2 rounded-md border border-zinc-500"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
