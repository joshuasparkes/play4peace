'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFutbol } from '@fortawesome/free-solid-svg-icons';

interface FootballFormationProps {
  attendees: string[];
  userNames: { [uid: string]: string };
  currentUserId: string;
  maxPlayers: number;
}

interface Position {
  id: number;
  name: string;
  team: 'A' | 'B';
  row: number; // 0 = GK, 1 = Defense, 2 = Midfield, 3 = Attack
}

export default function FootballFormation({
  attendees,
  userNames,
  currentUserId,
  maxPlayers,
}: FootballFormationProps) {
  // 4-4-2 formation positions for both teams
  const positions: Position[] = [
    // Team A (left side)
    { id: 0, name: 'GK', team: 'A', row: 0 },
    { id: 1, name: 'LB', team: 'A', row: 1 },
    { id: 2, name: 'CB', team: 'A', row: 1 },
    { id: 3, name: 'CB', team: 'A', row: 1 },
    { id: 4, name: 'RB', team: 'A', row: 1 },
    { id: 5, name: 'LM', team: 'A', row: 2 },
    { id: 6, name: 'CM', team: 'A', row: 2 },
    { id: 7, name: 'CM', team: 'A', row: 2 },
    { id: 8, name: 'RM', team: 'A', row: 2 },
    { id: 9, name: 'ST', team: 'A', row: 3 },
    { id: 10, name: 'ST', team: 'A', row: 3 },

    // Team B (right side)
    { id: 11, name: 'ST', team: 'B', row: 3 },
    { id: 12, name: 'ST', team: 'B', row: 3 },
    { id: 13, name: 'LM', team: 'B', row: 2 },
    { id: 14, name: 'CM', team: 'B', row: 2 },
    { id: 15, name: 'CM', team: 'B', row: 2 },
    { id: 16, name: 'RM', team: 'B', row: 2 },
    { id: 17, name: 'LB', team: 'B', row: 1 },
    { id: 18, name: 'CB', team: 'B', row: 1 },
    { id: 19, name: 'CB', team: 'B', row: 1 },
    { id: 20, name: 'RB', team: 'B', row: 1 },
    { id: 21, name: 'GK', team: 'B', row: 0 },
  ];

  // Assign players to positions (first come, first served)
  const positionAssignments: { [key: number]: string } = {};
  attendees.forEach((uid, index) => {
    if (index < positions.length) {
      positionAssignments[positions[index].id] = uid;
    }
  });

  const renderPlayer = (position: Position) => {
    const playerId = positionAssignments[position.id];
    const playerName = playerId ? userNames[playerId] || 'Loading...' : null;
    const isCurrentUser = playerId === currentUserId;

    return (
      <div
        key={position.id}
        className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${
          playerName
            ? isCurrentUser
              ? 'bg-purple-600 text-white shadow-lg scale-105'
              : 'bg-white border-2 border-gray-300 text-gray-900'
            : 'bg-gray-100 border-2 border-dashed border-gray-300 text-gray-400'
        }`}
      >
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-opacity-20 bg-current flex items-center justify-center mb-1">
          <FontAwesomeIcon icon={faFutbol} className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <p className="text-xs font-semibold text-center leading-tight">
          {playerName ? (
            <>
              {playerName.split(' ')[0]}
              {playerName.split(' ')[1] && (
                <span className="block text-[10px] opacity-75">
                  {playerName.split(' ')[1][0]}.
                </span>
              )}
            </>
          ) : (
            position.name
          )}
        </p>
      </div>
    );
  };

  const teamAPositions = positions.filter((p) => p.team === 'A');
  const teamBPositions = positions.filter((p) => p.team === 'B');

  const renderTeamFormation = (teamPositions: Position[], teamName: string, reverse = false) => {
    const rows = [
      teamPositions.filter((p) => p.row === 0), // GK
      teamPositions.filter((p) => p.row === 1), // Defense
      teamPositions.filter((p) => p.row === 2), // Midfield
      teamPositions.filter((p) => p.row === 3), // Attack
    ];

    if (reverse) rows.reverse();

    return (
      <div className="flex-1">
        <h3 className={`text-center font-bold text-lg mb-4 ${
          teamName === 'Team A' ? 'text-white' : 'text-white'
        }`}>
          {teamName}
        </h3>
        <div className="space-y-4">
          {rows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))`,
              }}
            >
              {row.map((position) => renderPlayer(position))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-green-800 rounded-xl p-4 sm:p-6 shadow-2xl">
      <div className="bg-green-700 bg-opacity-40 rounded-lg p-4 sm:p-6 backdrop-blur-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Team Formation (4-4-2)
          </h2>
          <p className="text-green-100 text-sm">
            {attendees.length} / {maxPlayers} players confirmed
          </p>
        </div>

        {/* Pitch with both formations */}
        <div className="bg-green-600 rounded-lg p-4 sm:p-6 relative">
          {/* Center line */}
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-white opacity-50" />
          {/* Center circle */}
          <div className="absolute left-1/2 top-1/2 w-16 h-16 sm:w-24 sm:h-24 border-2 border-white opacity-50 rounded-full -translate-x-1/2 -translate-y-1/2" />

          <div className="flex flex-col md:flex-row gap-6 md:gap-8 relative z-10">
            {renderTeamFormation(teamAPositions, 'Team A')}
            {renderTeamFormation(teamBPositions, 'Team B', true)}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
          <div className="flex items-center gap-2 bg-white bg-opacity-20 px-3 py-2 rounded-lg">
            <div className="w-4 h-4 bg-purple-600 rounded" />
            <span className="text-black">You</span>
          </div>
          <div className="flex items-center gap-2 bg-white bg-opacity-20 px-3 py-2 rounded-lg">
            <div className="w-4 h-4 bg-white rounded border-2 border-gray-300" />
            <span className="text-black">Other Players</span>
          </div>
          <div className="flex items-center gap-2 bg-white bg-opacity-20 px-3 py-2 rounded-lg">
            <div className="w-4 h-4 bg-gray-100 rounded border-2 border-dashed border-gray-300" />
            <span className="text-black">Available</span>
          </div>
        </div>

        {/* Mobile tip */}
        <p className="text-center text-green-100 text-xs mt-4">
          Join the game to secure your position!
        </p>
      </div>
    </div>
  );
}
