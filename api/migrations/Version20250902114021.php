<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250902114021 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE INDEX idx_reservation_pilote_debut_fin ON reservation (pilote_id, debut, fin)');
        $this->addSql('CREATE INDEX idx_reservation_avion_debut_fin ON reservation (avion_id, debut, fin)');

    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP INDEX idx_reservation_pilote_debut_fin ON reservation');
        $this->addSql('DROP INDEX idx_reservation_avion_debut_fin ON reservation');
    }
}
