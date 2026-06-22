import React, { useState, useEffect } from 'react';
import { personService } from '@/services/personService';
import PersonCard from './PersonCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import CreatePersonDialog from './CreatePersonDialog';
import EditPersonDialog from './EditPersonDialog';

const PeopleList = () => {
  const [people, setPeople] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPerson, setEditingPerson] = useState<any | null>(null);

  useEffect(() => {
    fetchPeople();
  }, []);

  const fetchPeople = async () => {
    setLoading(true);
    try {
      const { data: peopleList } = await personService.getAll();
      setPeople(peopleList);
    } catch (err) {
      console.error('Error fetching people:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (person: any) => {
    setEditingPerson(person);
  };

  const handleEditSuccess = (updatedPerson: any) => {
    setPeople((prev) =>
      prev.map((p) => (p.id === updatedPerson.id ? updatedPerson : p))
    );
    setEditingPerson(null);
  };

  const handleDelete = (personId: number) => {
    setPeople((prev: any[]) => prev.filter((p) => p.id !== personId));
  };

  const handleCreate = async (newPerson: any) => {
    setShowCreateDialog(false);
    await fetchPeople();
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">People</h1>
          <p className="text-gray-600 mt-2">View all members in your organization</p>
        </div>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Person
        </Button>
      </div>
      {loading ? (
        <div className="text-center text-gray-500">Loading people...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {people.map((person) => (
            <PersonCard
              key={person.id}
              person={person}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
      <CreatePersonDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
        onCreate={handleCreate}
      />
      {editingPerson && (
        <EditPersonDialog
          person={editingPerson}
          open={!!editingPerson}
          onOpenChange={(open) => !open && setEditingPerson(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
};

export default PeopleList; 