<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250428170046 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE profil_pilote_qualification (profil_pilote_id INT NOT NULL, qualification_id INT NOT NULL, PRIMARY KEY(profil_pilote_id, qualification_id))');
        $this->addSql('CREATE INDEX IDX_60B5039D5D6B9CC9 ON profil_pilote_qualification (profil_pilote_id)');
        $this->addSql('CREATE INDEX IDX_60B5039D1A75EE38 ON profil_pilote_qualification (qualification_id)');
        $this->addSql('ALTER TABLE profil_pilote_qualification ADD CONSTRAINT FK_60B5039D5D6B9CC9 FOREIGN KEY (profil_pilote_id) REFERENCES profil_pilote (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE profil_pilote_qualification ADD CONSTRAINT FK_60B5039D1A75EE38 FOREIGN KEY (qualification_id) REFERENCES qualification (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE profil_pilote_qualification DROP CONSTRAINT FK_60B5039D5D6B9CC9');
        $this->addSql('ALTER TABLE profil_pilote_qualification DROP CONSTRAINT FK_60B5039D1A75EE38');
        $this->addSql('DROP TABLE profil_pilote_qualification');
    }
}
