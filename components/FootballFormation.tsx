'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFutbol } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';

interface FootballFormationProps {
  attendees: string[];
  userProfiles: { [uid: string]: { displayName: string; photoURL?: string } };
  currentUserId: string;
  maxPlayers: number;
}

export default function FootballFormation({
  attendees,
  userProfiles,
  currentUserId,
  maxPlayers,
}: FootballFormationProps) {
  // Split players into two teams of 11
  const teamAPlayers = attendees.slice(0, 11);
  const teamBPlayers = attendees.slice(11, 22);

  const renderPlayerCard = (uid: string, index: number) => {
    const playerProfile = userProfiles[uid];
    const playerName = playerProfile?.displayName || 'Loading...';
    const playerPhoto = playerProfile?.photoURL;
    const isCurrentUser = uid === currentUserId;

    return (
      <div
        key={uid}
        className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
          isCurrentUser
            ? 'bg-purple-600 text-white shadow-lg'
            : 'bg-white border border-gray-200 hover:border-purple-300 hover:shadow-md'
        }`}
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gray-100">
          {playerPhoto ? (
            <Image
              src={playerPhoto}
              alt={playerName}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${isCurrentUser ? 'text-white' : 'text-purple-600'}`}>
              <FontAwesomeIcon icon={faFutbol} className="w-5 h-5" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm truncate ${isCurrentUser ? 'text-white' : 'text-gray-900'}`}>
            {playerName}
          </p>
          <p className={`text-xs ${isCurrentUser ? 'text-purple-100' : 'text-gray-500'}`}>
            Player {index + 1}
          </p>
        </div>
      </div>
    );
  };

  const renderEmptySlot = (index: number) => {
    return (
      <div
        key={`empty-${index}`}
        className="flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50"
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          <FontAwesomeIcon icon={faFutbol} className="w-5 h-5 text-gray-400" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm text-gray-400">Available</p>
          <p className="text-xs text-gray-400">Player {index + 1}</p>
        </div>
      </div>
    );
  };

  const renderTeamList = (players: string[], teamName: string, startIndex: number) => {
    const slots = Array.from({ length: 11 }, (_, i) => i);

    return (
      <div className="flex-1">
        <h3 className="text-center font-bold text-xl mb-4 text-purple-600 py-2 rounded-lg">
          {teamName}
        </h3>
        <div className="space-y-2">
          {slots.map((slotIndex) => {
            const player = players[slotIndex];
            return player
              ? renderPlayerCard(player, startIndex + slotIndex)
              : renderEmptySlot(startIndex + slotIndex);
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-green-800 to-green-700 rounded-xl p-4 sm:p-6 shadow-2xl">
      <div className="bg-white bg-opacity-10 rounded-lg p-4 sm:p-6 backdrop-blur-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Team Lineup</h2>
          <p className="text-green-800 text-sm">
            {attendees.length} / {maxPlayers} players confirmed
          </p>
        </div>

        {/* Two team lists */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderTeamList(teamAPlayers, 'Team A', 0)}
          {renderTeamList(teamBPlayers, 'Team B', 11)}
        </div>

      </div>
    </div>
  );
}
