<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250527144638 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE landing ADD vol_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE landing ADD CONSTRAINT FK_EF3ACE159F2BFB7A FOREIGN KEY (vol_id) REFERENCES vol (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_EF3ACE159F2BFB7A ON landing (vol_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE landing DROP CONSTRAINT FK_EF3ACE159F2BFB7A');
        $this->addSql('DROP INDEX IDX_EF3ACE159F2BFB7A');
        $this->addSql('ALTER TABLE landing DROP vol_id');
    }
}
